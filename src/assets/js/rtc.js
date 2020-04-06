/**
 * @author Amir Sanni <amirsanni@gmail.com>
 * @date 6th January, 2020
 */
import h from './helpers.js';

window.addEventListener('load', ()=>{
    const room = h.getQString(location.href, 'room');
    const username = sessionStorage.getItem('username');

    if(!room){
        document.querySelector('#room-create').attributes.removeNamedItem('hidden');
    }

    else if(!username){
        document.querySelector('#username-set').attributes.removeNamedItem('hidden');
    }

    else{
        let commElem = document.getElementsByClassName('room-comm');

        for(let i = 0; i < commElem.length; i++){
            commElem[i].attributes.removeNamedItem('hidden');
        }

        var pc = [];
        var sender = [];

        let socket = io('/stream');

        var socketId = '';
        var myStream = '';
        var videoIconElem = document.querySelector('#toggle-video');

        socket.on('connect', ()=>{
            //set socketId
            socketId = socket.io.engine.id;
        

            socket.emit('subscribe', {
                room: room,
                socketId: socketId
            });


            socket.on('new user', (data)=>{
                socket.emit('newUserStart', {to:data.socketId, sender:socketId});
                pc.push(data.socketId);
                init(true, data.socketId);
            });


            socket.on('newUserStart', (data)=>{
                pc.push(data.sender);
                init(false, data.sender);
            });


            socket.on('ice candidates', async (data)=>{
                data.candidate ? await pc[data.sender].addIceCandidate(new RTCIceCandidate(data.candidate)) : '';
            });


            socket.on('sdp', async (data)=>{
                if(data.description.type === 'offer'){
                    data.description ? await pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description)) : '';

                    h.getUserFullMedia().then(async (stream)=>{
                        if(!document.getElementById('local').srcObject){
                            document.getElementById('local').srcObject = stream;
                        }

                        //save my stream
                        myStream = stream;

                        stream.getTracks().forEach((track)=>{
                            sender[data.sender] = pc[data.sender].addTrack(track, stream);
                        });

                        let answer = await pc[data.sender].createAnswer();
                        
                        await pc[data.sender].setLocalDescription(answer);

                        socket.emit('sdp', {description:pc[data.sender].localDescription, to:data.sender, sender:socketId});
                    }).catch((e)=>{
                        console.error(e);
                    });
                }

                else if(data.description.type === 'answer'){
                    await pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description));
                }
            });


            socket.on('chat', (data)=>{
                h.addChat(data, 'remote');
            })
        });


        function sendMsg(msg){
            let data = {
                room: room,
                msg: msg,
                sender: username
            };

            //emit chat message
            socket.emit('chat', data);


            //add localchat
            h.addChat(data, 'local');
        }



        function init(createOffer, partnerName){console.log(partnerName);
            pc[partnerName] = new RTCPeerConnection(h.getIceServer());
            
            h.getUserFullMedia().then((stream)=>{
                //save my stream
                myStream = stream;

                stream.getTracks().forEach((track)=>{
                    sender[partnerName] = pc[partnerName].addTrack(track, stream);//should trigger negotiationneeded event
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

                    socket.emit('sdp', {description:pc[partnerName].localDescription, to:partnerName, sender:socketId});
                };
            }



            //send ice candidate to partnerNames
            pc[partnerName].onicecandidate = ({candidate})=>{
                socket.emit('ice candidates', {candidate: candidate, to:partnerName, sender:socketId});
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



        function broadcastUserFullMedia(){
            h.getUserFullMedia().then((stream)=>{
                videoIconElem.children[0].classList.add('fa-video');
                videoIconElem.children[0].classList.remove('fa-video-slash');
                videoIconElem.setAttribute('title', 'Hide Video');

                toggleShareIcons(false);

                //save my stream
                myStream = stream;

                //share the new stream with all partners
                for(let p in pc){
                    pc[p] = new RTCPeerConnection(h.getIceServer(), null);

                    stream.getTracks().forEach((track)=>{
                        pc[p].addTrack(track, stream);//should trigger negotiationneeded event
                    });
                }

                document.getElementById('local').srcObject = stream;
            }).catch();
        }



        function shareScreen(){
            stopVideo().then(()=>{
                h.shareScreen().then((stream)=>{
                    toggleShareIcons(true);

                    //save my stream
                    myStream = stream;

                    //share the new stream with all partners
                    for(let p in pc){
                        let pName = pc[p];

                        pc[pName] = new RTCPeerConnection(h.getIceServer(), null);

                        stream.getTracks().forEach((track)=>{
                            pc[pName].addTrack(track, stream);//should trigger negotiationneeded event
                        });

                        pc[pName].onnegotiationneeded = async ()=>{console.log('neg needed');
                            let offer = await pc[pName].createOffer();
                            
                            await pc[pName].setLocalDescription(offer);console.log(pName);
                        
                            socket.emit('sdp', {description:pc[pName].localDescription, to:pName, sender:socketId});
                        };
                    }

                    document.getElementById('local').srcObject = stream;

                    //When the stop sharing button shown by the browser is clicked
                    myStream.getVideoTracks()[0].addEventListener('ended', ()=>{
                        broadcastUserFullMedia();
                    });
                }).catch((e)=>{
                    console.error(`screen share error: ${e}`);
                });
            });
        }



        function stopVideo(){
            return new Promise((res, rej)=>{
                videoIconElem.children[0].classList.remove('fa-video');
                videoIconElem.children[0].classList.add('fa-video-slash');
                videoIconElem.setAttribute('title', 'Show Video');

                if(myStream && myStream.getTracks().length){
                    myStream.getTracks().forEach(track => track.stop());
                }

                res();
            });
        }



        function broadcastAudioOnly(){
            stopVideo().then(()=>{
                h.getUserAudio().then((stream)=>{
                    toggleShareIcons(false);
    
                    //save my stream
                    myStream = stream;
    
                    //share the new stream with all partners
                    for(let p in pc){
                        pc[p] = new RTCPeerConnection(h.getIceServer(), null);

                        stream.getTracks().forEach((track)=>{
                            pc[p].addTrack(track, stream);//should trigger negotiationneeded event
                        });
                    }
    
                    document.getElementById('local').srcObject = stream;
                }).catch((e)=>{
                    console.error('Audio only error: '+e);
                });
            });
            
        }



        function toggleShareIcons(share){
            if(share){
                document.querySelector('#share-screen').setAttribute('hidden', true);
                document.querySelector('#stop-screen-share').removeAttribute('hidden');
            }

            else{
                document.querySelector('#share-screen').removeAttribute('hidden');
                document.querySelector('#stop-screen-share').setAttribute('hidden', true);
            }
        }


        //Chat textarea
        document.getElementById('chat-input').addEventListener('keypress', (e)=>{
            if(e.which === 13 && (e.target.value.trim())){
                e.preventDefault();
                
                sendMsg(e.target.value);

                setTimeout(()=>{
                    e.target.value = '';
                }, 50);
            }
        });


        //When the video icon is clicked
        document.getElementById('toggle-video').addEventListener('click', (e)=>{
            e.preventDefault();

            // myStream.getVideoTracks()[0].enabled = !(myStream.getVideoTracks()[0].enabled);
            if(myStream.getVideoTracks().length){
                broadcastAudioOnly();
            }

            else{
                broadcastUserFullMedia();
            }
        });


        //When the mute icon is clicked
        document.getElementById('toggle-mute').addEventListener('click', (e)=>{
            e.preventDefault();

            myStream.getAudioTracks()[0].enabled = !(myStream.getAudioTracks()[0].enabled);

            //toggle audio icon
            e.target.classList.toggle('fa-microphone-alt');
            e.target.classList.toggle('fa-microphone-alt-slash');
            
            let elem = document.getElementById('toggle-mute');
            elem.setAttribute('title', elem.getAttribute('title') == 'Mute' ? 'Unmute' : 'Mute');
        });


        //When user clicks the 'Share screen' button
        document.getElementById('share-screen').addEventListener('click', (e)=>{
            e.preventDefault();

            shareScreen();
        });


        //When user clicks the stop sharing button
        document.getElementById('stop-screen-share').addEventListener('click', (e)=>{
            e.preventDefault();

            broadcastUserFullMedia();
        });
    }
});