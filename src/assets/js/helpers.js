export default {
    closeVideo(elemId){
        if(document.getElementById(elemId)){
            document.getElementById(elemId).remove();
        }
    },


    getQString(url='', keyToReturn=''){
        url = url ? url : location.href;
        let queryStrings = decodeURIComponent(url).split('#', 2)[0].split('?', 2)[1];
        
        if(queryStrings){
            let splittedQStrings = queryStrings.split('&');
            
            if(splittedQStrings.length){
                let queryStringObj = {};
                
                splittedQStrings.forEach(function(keyValuePair){
                    let keyValue = keyValuePair.split('=', 2);
                    
                    if(keyValue.length){
                        queryStringObj[keyValue[0]] = keyValue[1];
                    }
                });            
                
                return keyToReturn ? (queryStringObj[keyToReturn] ? queryStringObj[keyToReturn] : null) : queryStringObj;
            }
            
            return null;
        }
        
        return null;
    },


    userMediaAvailable(){
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    },


    getUserMedia(){
        if(this.userMediaAvailable()){
            return navigator.mediaDevices.getUserMedia({
                video: true, 
                audio: {
                    echoCancellation: true
                }
            });
        }

        else{
            throw new Error('User media not available');
        }
    },


    getIceServer(){
        return {iceServers: [{   urls: [ "stun:eu-turn4.xirsys.com" ]}, {   username: "ml0jh0qMKZKd9P_9C0UIBY2G0nSQMCFBUXGlk6IXDJf8G2uiCymg9WwbEJTMwVeiAAAAAF2__hNSaW5vbGVl",   credential: "4dd454a6-feee-11e9-b185-6adcafebbb45",   urls: [       "turn:eu-turn4.xirsys.com:80?transport=udp",       "turn:eu-turn4.xirsys.com:3478?transport=udp",       "turn:eu-turn4.xirsys.com:80?transport=tcp",       "turn:eu-turn4.xirsys.com:3478?transport=tcp",       "turns:eu-turn4.xirsys.com:443?transport=tcp",       "turns:eu-turn4.xirsys.com:5349?transport=tcp"   ]}]};
    }
};