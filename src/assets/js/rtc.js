/**
 * @author Amir Sanni <amirsanni@gmail.com>
 * @date 6th January, 2020
 */
import h from './helpers.js';

window.addEventListener('load', ()=>{
    const room = h.getQString(location.href, 'room');
    
    const streamConstraints = {
        video: true, 
        audio: {
            echoCancellation: true
        }
    };

    var pc = [];

    let socket = io('/stream');

    var username = '';

    socket.on('connect', ()=>{
        //set username
        username = socket.io.engine.id;
    

        socket.emit('subscribe', {
            room: room,
            username: username
        });


        socket.on('new user', (data)=>{
            socket.emit('newUserStart', {to:data.username, sender:username});
            pc.push(data.username);
            init(true, data.username);
        });


        socket.on('newUserStart', (data)=>{
            pc.push(data.sender);
            init(false, data.sender);
        });


        socket.on('ice candidates', async (data)=>{
            data.candidate ? await pc[data.sender].addIceCandidate(new RTCIceCandidate(data.candidate)) : '';
        });

        navigator.mediaDevices.getUserMedia(streamConstraints).then(async (stream)=>{
            if(!document.getElementById('local').srcObject){
                document.getElementById('local').srcObject = stream;
            }
        }).catch((e)=>{
            console.error(e);
        });


        socket.on('sdp', async (data)=>{
            if(data.description.type === 'offer'){
                data.description ? await pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description)) : '';

                navigator.mediaDevices.getUserMedia(streamConstraints).then(async (stream)=>{
                    if(!document.getElementById('local').srcObject){
                        document.getElementById('local').srcObject = stream;
                    }

                    stream.getTracks().forEach((track)=>{
                        pc[data.sender].addTrack(track, stream);
                    });

                    let answer = await pc[data.sender].createAnswer();
                    
                    await pc[data.sender].setLocalDescription(answer);

                    socket.emit('sdp', {description:pc[data.sender].localDescription, to:data.sender, sender:username});
                }).catch((e)=>{
                    console.error(e);
                });
            }

            else if(data.description.type === 'answer'){
                await pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description));
            }
        });
    });



    function init(createOffer, partnerName){
        pc[partnerName] = new RTCPeerConnection({iceServers: [{   urls: [ "stun:eu-turn4.xirsys.com" ]}, {   username: "ml0jh0qMKZKd9P_9C0UIBY2G0nSQMCFBUXGlk6IXDJf8G2uiCymg9WwbEJTMwVeiAAAAAF2__hNSaW5vbGVl",   credential: "4dd454a6-feee-11e9-b185-6adcafebbb45",   urls: [       "turn:eu-turn4.xirsys.com:80?transport=udp",       "turn:eu-turn4.xirsys.com:3478?transport=udp",       "turn:eu-turn4.xirsys.com:80?transport=tcp",       "turn:eu-turn4.xirsys.com:3478?transport=tcp",       "turns:eu-turn4.xirsys.com:443?transport=tcp",       "turns:eu-turn4.xirsys.com:5349?transport=tcp"   ]}]});
        
        navigator.mediaDevices.getUserMedia(streamConstraints).then((stream)=>{
            stream.getTracks().forEach((track)=>{
                pc[partnerName].addTrack(track, stream);//should trigger negotiationneeded event
            });

            document.getElementById('local').srcObject = stream;
        }).catch((e)=>{
            console.error(`stream error: ${e}`);
        });



        //create offer
        if(createOffer){
            pc[partnerName].onnegotiationneeded = async ()=>{
                let offer = await pc[partnerName].createOffer();
                
                await pc[partnerName].setLocalDescription(offer);

                socket.emit('sdp', {description:pc[partnerName].localDescription, to:partnerName, sender:username});
            };
        }



        //send ice candidate to partnerNames
        pc[partnerName].onicecandidate = ({candidate})=>{
            socket.emit('ice candidates', {candidate: candidate, to:partnerName, sender:username});
        };



        //add
        pc[partnerName].ontrack = (e)=>{
            let str = e.streams[0];
            if(document.getElementById(`${partnerName}-video`)){
                document.getElementById(`${partnerName}-video`).srcObject = str;
            }

            else{
                //video elem
                let newVid = document.createElement('video');
                newVid.id = `${partnerName}-video`;            
                newVid.srcObject = str;
                newVid.autoplay = true;
                newVid.className = 'remote-video';
                
                //create a new div for card
                let cardDiv = document.createElement('div');
                cardDiv.className = 'card mb-3';
                cardDiv.appendChild(newVid);
                
                //create a new div for everything
                let div = document.createElement('div');
                div.className = 'col-sm-12 col-md-6';
                div.id = partnerName;
                div.appendChild(cardDiv);
                
                //put div in videos elem
                document.getElementById('videos').appendChild(div);
            }
        };



        pc[partnerName].onconnectionstatechange = (d)=>{
            switch(pc[partnerName].iceConnectionState){
                case 'disconnected':
                case 'failed':
                    h.closeVideo(partnerName);
                    break;
                    
                case 'closed':
                    h.closeVideo(partnerName);
                    break;
            }
        };



        pc[partnerName].onsignalingstatechange = (d)=>{
            switch(pc[partnerName].signalingState){
                case 'closed':
                    console.log("Signalling state is 'closed'");
                    h.closeVideo(partnerName);
                    break;
            }
        };
    }
});