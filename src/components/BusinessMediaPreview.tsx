import { useVideoPlayer, VideoView } from "expo-video";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { ownerMediaSource } from "../media/source";
function Player({uri,token}:{uri:string;token?:string|null}){const player=useVideoPlayer(ownerMediaSource(uri,token));return <VideoView player={player} style={{height:210,width:"100%"}} nativeControls fullscreenOptions={{enable:true}}/>;}
export function BusinessMediaPreview({uri,video=false,small=false,label="نمونه‌کار",token}:{uri:string;video?:boolean;small?:boolean;label?:string;token?:string|null}){
 const [open,setOpen]=useState(false);
 if(!video)return <Image source={ownerMediaSource(uri,token)} style={small?{width:80,height:80,borderRadius:8}:{height:210,borderRadius:12}} resizeMode="contain" accessibilityLabel={label}/>;
 return <View>{open?<Player uri={uri} token={token}/>:<Pressable accessibilityRole="button" accessibilityLabel="پخش ویدیو" onPress={()=>setOpen(true)} style={{padding:20,backgroundColor:"#E5EFEA",borderRadius:12}}><Text>▶ ویدیو</Text></Pressable>}{open&&<Pressable onPress={()=>setOpen(false)}><Text>بستن ویدیو</Text></Pressable>}</View>;
}
