import React, { useEffect, useRef } from 'react';
import { useContract, useContractRead, useContractWrite } from '@thirdweb-dev/react';
import CommunitySBTABI from '../../abi/CommunitySBT.json';
import { useSbtIPFS } from '../../hooks/hooks'
const Sendsbt = (props) => {
  let cName = "CSBS";
  let cDescription = "CSBS description";
  const myCanvas = useRef();

  const { contract, isLoading, error } = useContract("0x3CA7dCA365D135e51210EFFE70b158cCd82d3deF", CommunitySBTABI);
  const {
    mutate: sedsbt,
    isLoading: isSBTWithLoging,
    error: isSBTWithError,
  } = useContractWrite(contract, "issueBatchSBTWithEvent");


  const CreateImageBob = async (item) => {
    let base64path = await addImageProcess(props.img, item)
    return base64path
  }

  const SBTexist = async (address, tokenId) => {
    try {
      console.log('ddd')
      const exist = await contract.call("ownSBTs", address, tokenId)
      console.log('exist', exist)
      exist.toString();
      return 0;
    } catch (error) {
      console.log(error)
      return 1
    }
  }
  function addImageProcess(src, item) {
    return new Promise((resolve, reject) => {
      const context = myCanvas.current.getContext("2d");
      let img = new Image()
      img.onload = () => {
        context.drawImage(img, 0, 0, 3840, 3840);
        if (props["l"] === "SBT1") {
          context.fillStyle = '#1C98A8';
        } else if (props["l"] === "SBT2") {
          context.fillStyle = '#A57949';
        } else {
          context.fillStyle = '#FFFFFF';
        }
        context.font = "700 200px Inter";
        context.textAlign = "center";
        context.fillText(item.nickName, 1920, 3520);
        context.font = "600 150px Inter";
        context.textAlign = "center";
        context.fillText(item.roleName, 1920, 3750);
        resolve(myCanvas.current.toDataURL("image/png"))
      };
      img.src = src
    })
  }

  const SendSBT = async () => {
    let address = [];
    let metadata = [];

    for (let index = 0; index < props.data.length; index++) {

      const list = props.data[index];
      let exists = await SBTexist(list.address, 2);
      if (exists) {
        console.log('in')
        let imageData = await CreateImageBob(list)
        let blob = dataURItoBlob(imageData)
        let file = new File([blob], "image.png", { type: 'image/png' });
        // eslint-disable-next-line react-hooks/rules-of-hooks
        let url = await useSbtIPFS(cName, cDescription, file, list.nickName, list.roleName);
        address.push(list.address)
        metadata.push(url)
      }
    }

    await sedsbt([2, address, metadata]);
    if (isSBTWithLoging) {
      console.log('上傳完畢')
    }
  }
  function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
  }

  useEffect(() => {

  });

  return (
    // 發送sbt 功能
    // 先跳警語我們將上傳
    // 上傳社區資料+IPFS -> address,url
    // 開始上傳 SBT IPFS
    // 互叫智能合約
    <div>
      <label htmlFor="my-modal-g" className="btn btn-active btn-primary">發送</label>
      <input type="checkbox" id="my-modal-g" className="modal-toggle" />
      <div className="modal">
        <div className="relative modal-box">
          <label htmlFor="my-modal-g" className="absolute btn btn-sm btn-circle right-2 top-2">✕</label>
          <h3 className="text-lg font-bold">準備</h3>
          <p className="py-4">點下確認開始～～發送</p>
          <button onClick={SendSBT} class="btn btn-info">確定</button>
          <canvas ref={myCanvas} width={3840} height={3840} style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  )
}

export default Sendsbt
