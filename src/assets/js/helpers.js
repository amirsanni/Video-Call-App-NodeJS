export default {
    generateRandomString(){
        return Math.random().toString(36).slice(2).substring(0, 15);
    },


    closeVideo(elemId){
        if(document.getElementById(elemId)){
            document.getElementById(elemId).remove();
        }
    },


    pageHasFocus(){
        return !(document.hidden || document.onfocusout || window.onpagehide || window.onblur);
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
    },
    
    
    addChat(data, senderType){
        let chatMsgDiv = document.querySelector('#chat-messages');
        let contentAlign = 'justify-content-end';
        let senderName = 'You';
        let msgBg = 'bg-white';

        if(senderType === 'remote'){
            contentAlign = 'justify-content-start';
            senderName = data.sender;
            msgBg = '';

            this.toggleChatNotificationBadge();
        }

        let infoDiv = document.createElement('div');
        infoDiv.className = 'sender-info';
        infoDiv.innerHTML = `${senderName} - ${moment().format('Do MMMM, YYYY h:mm a')}`;

        let colDiv = document.createElement('div');
        colDiv.className = `col-10 card chat-card msg ${msgBg}`;
        colDiv.innerHTML =  data.msg;

        let rowDiv = document.createElement('div');
        rowDiv.className = `row ${contentAlign} mb-2`;


        colDiv.appendChild(infoDiv);
        rowDiv.appendChild(colDiv);

        chatMsgDiv.appendChild(rowDiv);

        /**
         * Move focus to the newly added message but only if:
         * 1. Page has focus
         * 2. User has not moved scrollbar upward. This is to prevent moving the scroll position if user is reading previous messages.
         */
        if(this.pageHasFocus){
            rowDiv.scrollIntoView();
        }
    },


    toggleChatNotificationBadge(){
        if(document.querySelector('#chat-pane').classList.contains('chat-opened')){
            document.querySelector('#new-chat-notification').setAttribute('hidden', true);
        }

        else{
            document.querySelector('#new-chat-notification').removeAttribute('hidden');
        }
    }
};