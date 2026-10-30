import { normalizeSelfHostedUrl } from './self-hosted-connection'
const roomPattern=/^[a-f0-9]{64}$/
const idPattern=/^[a-f0-9]{32}$/
function validate(room:string,id?:string):void {
  if(!roomPattern.test(room)||(id!==undefined&&!idPattern.test(id)))
    throw new Error('Invalid change identity')
}
function sealed(bytes:Uint8Array):void {
  if(bytes.length<29||bytes.length>65536||bytes[0]!==1)
    throw new Error('Invalid encrypted change')
}
function decode(value:unknown):Uint8Array {
  if(typeof value!=='string'||!/^[A-Za-z0-9_-]+$/.test(value)||value.length>87384)
    throw new Error('Invalid encrypted change')
  try {
    const binary=atob(value.replaceAll('-','+').replaceAll('_','/'))
    const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0))
    sealed(bytes)
    return bytes
  } catch { throw new Error('Invalid encrypted change') }
}
/** Optional memory-only alternative to the durable self-hosted change API. */
export function createEphemeralRelayChangeClient(
  serverUrl:string,roomToken:string,fetchImpl:typeof fetch=fetch,
){
  const origin=normalizeSelfHostedUrl(serverUrl)
  if(!roomToken.trim())throw new Error('Room access token is required')
  const auth={Authorization:`Bearer ${roomToken}`}
  return {
    async upload(room:string,id:string,ciphertext:Uint8Array):Promise<boolean>{
      validate(room,id)
      if(!(ciphertext instanceof Uint8Array))throw new Error('Invalid encrypted change')
      sealed(ciphertext)
      const response=await fetchImpl(`${origin}/v1/rooms/${room}/messages/${id}`,{
        method:'PUT',redirect:'error',cache:'no-store',
        headers:{...auth,'Content-Type':'application/octet-stream'},
        body:new Uint8Array(ciphertext) as BodyInit,
      })
      if(response.status===401||response.status===403)throw new Error('Room permission denied')
      if(response.status===429)throw new Error('Relay rate limit reached')
      if(!response.ok)throw new Error('Relay upload failed')
      return response.status===201
    },
    async download(room:string):Promise<Array<{id:string;ciphertext:Uint8Array}>>{
      validate(room)
      const response=await fetchImpl(`${origin}/v1/rooms/${room}/messages`,{
        method:'GET',redirect:'error',cache:'no-store',headers:auth,
      })
      if(response.status===401||response.status===403)throw new Error('Room permission denied')
      if(response.status===429)throw new Error('Relay rate limit reached')
      if(!response.ok)throw new Error('Relay download failed')
      const body:unknown=await response.json()
      if(!body||typeof body!=='object'||!('messages' in body)||!Array.isArray(body.messages))
        throw new Error('Invalid relay response')
      return body.messages.map((item:unknown)=>{
        if(!item||typeof item!=='object'||!('id' in item)||!('ciphertext' in item)||
          typeof item.id!=='string'||!idPattern.test(item.id))
          throw new Error('Invalid relay response')
        return {id:item.id,ciphertext:decode(item.ciphertext)}
      })
    },
  }
}
