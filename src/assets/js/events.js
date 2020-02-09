import helpers from './helpers.js';

window.addEventListener('load', ()=>{
    //When the chat icon is clicked
    document.querySelector('#toggle-chat-pane').addEventListener('click', (e)=>{
        document.querySelector('#chat-pane').classList.toggle('chat-opened');

        //remove the 'New' badge on chat icon (if any) once chat is opened.
        helpers.toggleChatNotificationBadge();
    });


    //When the video frame is clicked. This will enable picture-in-picture
    document.getElementById('local').addEventListener('click', ()=>{
        if (!document.pictureInPictureElement) {
            document.getElementById('local').requestPictureInPicture()
            .catch(error => {
                // Video failed to enter Picture-in-Picture mode.
                console.error(error);
            });
        } 
          
        else {
            document.exitPictureInPicture()
            .catch(error => {
                // Video failed to leave Picture-in-Picture mode.
                console.error(error);
            });
        }
    });


    //When the 'Create room" is button is clicked
    document.getElementById('create-room').addEventListener('click', (e)=>{
        e.preventDefault();

        let roomName = document.querySelector('#room-name').value;
        let yourName = document.querySelector('#your-name').value;

        if(roomName && yourName){
            //remove error message, if any
            document.querySelector('#err-msg').innerHTML = "";

            //save the user's name in sessionStorage
            sessionStorage.setItem('username', yourName);

            //create room link
            let roomLink = `${location.origin}?room=${roomName.trim().replace(' ', '_')}_${helpers.generateRandomString()}`;

            //show message with link to room
            document.querySelector('#room-created').innerHTML = `Room successfully created. Click <a href='${roomLink}'>here</a> to enter room. 
                Share the room link with your partners.`;

            //empty the values
            document.querySelector('#room-name').value = '';
            document.querySelector('#your-name').value = '';
        }

        else{
            document.querySelector('#err-msg').innerHTML = "All fields are required";
        }
    });


    //When the 'Enter room' button is clicked.
    document.getElementById('enter-room').addEventListener('click', (e)=>{
        e.preventDefault();

        let name = document.querySelector('#username').value;

        if(name){
            //remove error message, if any
            document.querySelector('#err-msg-username').innerHTML = "";

            //save the user's name in sessionStorage
            sessionStorage.setItem('username', name);

            //reload room
            location.href = `${location.origin}?room=${room}`;
        }

        else{
            document.querySelector('#err-msg-username').innerHTML = "Please input your name";
        }
    });
})