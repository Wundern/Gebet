const { nowInSec, SkyWayAuthToken, SkyWayContext, SkyWayRoom, SkyWayStreamFactory, uuidV4 } = skyway_room;
const token = new SkyWayAuthToken({
    jti: uuidV4(),
    iat: nowInSec(),
    exp: nowInSec() + 60 * 60 * 24,
    scope: {
      app: {
        id: '204eecb1-c220-46f4-9dfc-113b5e65a787',
        turn: true,
        actions: ['read'],
        channels: [
          {
            id: '*',
            name: '*',
            actions: ['write'],
            members: [
              {
                id: '*',
                name: '*',
                actions: ['write'],
                publication: {
                  actions: ['write'],
                },
                subscription: {
                  actions: ['write'],
                },
              },
            ],
            sfuBots: [
              {
                actions: ['write'],
                forwardings: [
                  {
                    actions: ['write'],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  }).encode('2hxXOfLpfz8eBZbUd0HL8Rd6bt/dof2q/apAs2XoKfI=');

(async () => {
    // 1
    const localVideo = document.getElementById('local-video');
    const buttonArea = document.getElementById('button-area');
    const remoteMediaArea = document.getElementById('remote-media-area');

    // const myId = document.getElementById('my-id');

    //const { audio, video } = await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream(); // 2
    const audio = await SkyWayStreamFactory.createMicrophoneAudioStream();
    a = 1;
    const video = await SkyWayStreamFactory.createCameraVideoStream();
    v = 1;

    video.attach(localVideo); // 3
    await localVideo.play(); // 4

    // URLを取得
    let url = new URL(window.location.href);

    // URLSearchParamsオブジェクトを取得
    let params = url.searchParams;

    // getメソッド
    roomID = params.get('id'); // 5
    console.log(roomID);

    const context = await SkyWayContext.Create(token);

    const room = await SkyWayRoom.FindOrCreate(context, {
        type: 'p2p',
        name: roomID,
    });
    
    const me = await room.join();
    
    // myId.textContent = me.id;

    const publication_audio = await me.publish(audio);
    const publication_video = await me.publish(video);

    const subscribeAndAttach = (publication) => {
      // 3
      if (publication.publisher.id === me.id) return;
    
      (async () => {
        // 3-2
        const { stream } = await me.subscribe(publication.id); // 3-2-1

        // let newMedia_video, newMedia_audio;
        // newMedia_video = document.createElement('video');
        // newMedia_video.playsInline = true; // 動画を全画面モードではなく、インラインで再生する
        // newMedia_video.autoplay = true; // 動画の自動再生

        // stream.attach(newMedia_video); // 3-2-3
        // remoteMediaArea.appendChild(newMedia_video);

        let newMedia; // 3-2-2
        switch (stream.track.kind) {
          case 'video':
            newMedia = document.createElement('video');
            newMedia.playsInline = true;
            newMedia.autoplay = true;
            break;
          case 'audio':
            newMedia = document.createElement('audio');
            // newMedia.controls = true;
            newMedia.autoplay = true;
            break;
          default:
            return;
        }
        stream.attach(newMedia); // 3-2-3
        remoteMediaArea.appendChild(newMedia);
      })();
    };
    
    room.publications.forEach(subscribeAndAttach); // 1
    
    room.onStreamPublished.add((e) => {
      // 2
      subscribeAndAttach(e.publication);
    });

    //ミュート・アンミュート
    document.getElementById("muteUnmute()").onclick = function(){
      console.log("a=" + a);
      if (a==1) {
        console.log("if");
        publication_audio.disable();
        setUnmuteButton();
        a = 0;
      } else {
        console.log("else");
        publication_audio.enable();
        setMuteButton();
        a = 1;
      }
    };

    //ミュートボタン
    const setMuteButton = () => {
      console.log("mute");
      const html = `
          <i class="fas fa-microphone"></i>
          <span>Mute</span>    
      `
      document.querySelector('.main_mute_button').innerHTML = html;
    }

    //アンミュートボタン
    const setUnmuteButton = () => {
      console.log("unmute");
      const html = `
          <i class="unmute fas fa-microphone-slash"></i>
          <span>Unmute</span>    
      `
      document.querySelector('.main_mute_button').innerHTML = html;
    }

    //ビデオ開始・停止
    document.getElementById("playStop()").onclick = function(){
      console.log("v=" + v);
      if (v==1) {
        publication_video.disable();
        setPlayVideo();
        v = 0;
      } else {
        publication_video.enable();
        setStopVideo();
        v = 1;
      }
    };

    //ビデオ停止ボタン
    const setStopVideo = () => {
      const html = `
          <i class ="fas fa-video"></i>
          <span>Stop Video</span>
      `
      document.querySelector('.main_video_button').innerHTML = html;
    }

    //ビデオ開始ボタン
    const setPlayVideo = () => {
      const html = `
          <i class ="stop fas fa-video-slash"></i>
          <span>Play Video</span>
      `
      document.querySelector('.main_video_button').innerHTML = html;
    }

    // for closing room members
    // room.on('peerLeave', peerId => {
    //   remoteMediaArea.srcObject.getTracks().forEach(track => track.stop());
    //   remoteMediaArea.srcObject = null;
    //   remoteMediaArea.remove();

    //   messages.textContent += `=== ${peerId} left ===\n`;
    // });

    // for closing myself
    // room.once('close', () => {
    //   sendTrigger.removeEventListener('click', onClickSend);
    //   messages.textContent += '== You left ===\n';
    //   Array.from(remoteVideos.children).forEach(remoteVideo => {
    //     remoteVideo.srcObject.getTracks().forEach(track => track.stop());
    //     remoteVideo.srcObject = null;
    //     remoteVideo.remove();
    //   });
    // });

    const socket = io('/');
    
    let text = $('input');

    $('html').keydown((e) => {
        if(e.which == 13 && text.val().length !== 0){
            //console.log(text.val())
            socket.emit('message', text.val());
            text.val('')
        }
    })

    socket.on('createMessage', message => {
        $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`);
    })

})(); // 1



