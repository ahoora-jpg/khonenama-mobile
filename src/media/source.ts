import { API_BASE } from "../api/client";
export function ownerMediaSource(uri:string,token?:string|null){
 try{const target=new URL(uri,API_BASE),origin=new URL(API_BASE);if(target.protocol==="https:" && target.origin===origin.origin && target.pathname.startsWith("/media/businesses/") && token)return {uri:target.href,headers:{Authorization:`Bearer ${token}`}};}catch{/* Local picker assets do not need authentication. */}
 return {uri};
}
