/// <reference types="node" />
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ConfigContext, ExpoConfig } from "expo/config";
export default ({config}:ConfigContext):ExpoConfig=>{
 const file=process.env.GOOGLE_SERVICES_JSON || (existsSync("google-services.json")?"./google-services.json":undefined);
 if(file){
  const content=JSON.parse(readFileSync(resolve(file),"utf8"));
  if(!content.client?.some((client:any)=>client.client_info?.android_client_info?.package_name===config.android?.package))throw new Error("Firebase configuration must target ir.khonenama.app");
 }
 if(process.env.REQUIRE_PUSH_CONFIG==="1"&&!file)throw new Error("Android push build requires GOOGLE_SERVICES_JSON or google-services.json");
 return {...config,name:config.name||"خونه‌نما",slug:config.slug||"khonenama",android:{...config.android,...(file?{googleServicesFile:file}:{})}};
};
