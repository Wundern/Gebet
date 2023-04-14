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
    const roomNameInput = document.getElementById('room-name');
    
    
    const myId = document.getElementById('my-id');
    const joinButton = document.getElementById('join');

    const { audio, video } = await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream(); // 2
  
    video.attach(localVideo); // 3
    await localVideo.play(); // 4

    // joinButton.onclick = async () => {
    // (async () => {
        // if (roomNameInput.value === '') return;
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
        
        myId.textContent = me.id;
    
        await me.publish(audio);
        await me.publish(video);
    
        const subscribeAndAttach = (publication) => {
            // 3
            if (publication.publisher.id === me.id) return;
          
            // const subscribeButton = document.createElement('button'); // 3-1
            // subscribeButton.textContent = `${publication.publisher.id}: ${publication.contentType}`;
          
            // buttonArea.appendChild(subscribeButton);
          
            // subscribeButton.onclick = async () => {
            (async () => {
              // 3-2
              const { stream } = await me.subscribe(publication.id); // 3-2-1

              // let newMedia; // 3-2-2
              // switch (stream.track.kind) {
              //   case 'video':
              //     newMedia = document.createElement('video');
              //     newMedia.playsInline = true;
              //     newMedia.autoplay = true;
              //     break;
              //   case 'audio':
              //     newMedia = document.createElement('audio');
              //     newMedia.controls = true;
              //     newMedia.autoplay = true;
              //     break;
              //   default:
              //     return;
              // }

              let newMedia_video, newMedia_audio;
              newMedia_video = document.createElement('video');
              newMedia_video.playsInline = true;
              newMedia_video.autoplay = true;
              newMedia_audio = document.createElement('audio');
              newMedia_audio.controls = true;
              newMedia_audio.autoplay = true;

              // stream.attach(newMedia); // 3-2-3
              // remoteMediaArea.appendChild(newMedia);

              stream.attach(newMedia_video); // 3-2-3
              remoteMediaArea.appendChild(newMedia_video);
              stream.attach(newMedia_audio); // 3-2-3
              remoteMediaArea.appendChild(newMedia_audio);
            })();
          };
          
          room.publications.forEach(subscribeAndAttach); // 1
          
          room.onStreamPublished.add((e) => {
            // 2
            subscribeAndAttach(e.publication);
          });
    // })();

})(); // 1