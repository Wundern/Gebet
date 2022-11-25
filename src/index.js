import Peer from "skyway-js";

// ピアの準備
const peer = new Peer({
  key: "c592d616-ab7a-481e-b0c0-e630dd272bc7",
  debug: 3,
});
// PeerID取得時に呼ばれる
peer.on("open", () => {
  document.getElementById("my-id").textContent = peer.id;
});
// 接続要求時の受信時に呼ばれる
peer.on("call", (mediaConnection) => {
  mediaConnection.answer(localStream);
  setEventListener(mediaConnection);
});

// カメラ映像の取得
let localStream;
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  // 成功時
  .then((stream) => {
    // video要素でカメラ映像を再生
    const videoElm = document.getElementById("my-video");
    videoElm.srcObject = stream;
    videoElm.play();

    // ストリームの保持
    localStream = stream;
  })
  // エラー時
  .catch((error) => {
    console.error("カメラ映像の取得失敗:", error);
    return;
  });

// 接続要求の送信
document.getElementById("make-call").onclick = () => {
  const theirID = document.getElementById("their-id").value;
  const mediaConnection = peer.call(theirID, localStream);
  setEventListener(mediaConnection);
};

// 接続時に呼ばれる
const setEventListener = (mediaConnection) => {
  mediaConnection.on("stream", (stream) => {
    // video要素でカメラ映像を再生
    const videoElm = document.getElementById("their-video");
    videoElm.srcObject = stream;
    videoElm.play();
  });
};