const {regionMenu, subregionMenu, cameraInRegionMenu, getDescriptionByKey} = require("./tdCamMenu");
const {sendTrafficPhoto} = require('./tdCamPhoto');

async function tdCam(match, params) {
    const {chatId, messageId} = params;

    const camMatch = /([^_]*)_*([^_]*)/.exec(match[2]);

    // cameras/subregion in a region
    if (camMatch && camMatch[1] === 'region') {
      await cameraInRegionMenu(chatId, camMatch[2], true, messageId);

      return;
    }

    // get cameras in subregion
    if(camMatch && camMatch[1] === 'subregion'){
        const subregionMatch = /([^_]*)_*([^_]*)_*([^_]*)/.exec(match[2]);

        await subregionMenu(chatId, subregionMatch[2], subregionMatch[3], true, messageId);

        return;
    }

    // get camera (get photo) with camera key
    if (camMatch && camMatch[1] === 'camera') {
      const key = camMatch[2];
      const {description} = await getDescriptionByKey(key);

      await sendTrafficPhoto(chatId, {
        key, description,
      });

      return;
    }

    // list of regions
    await regionMenu(chatId, true, messageId);
    return;
}

async function tdCamCallback({message, data}, chatId) {
    const args = /(.*):\s+(.*\s+)*(.*)/.exec(data);

    if (args[2]) {
      if (args[2].trim().toLowerCase() === "region") {
        // get menu by region
        await cameraInRegionMenu(chatId, args[3].trim(), true, message.message_id);
        return;
      }

      if(args[2].trim().toLowerCase() === 'subregion'){
          await subregionMenu(chatId, args[3].trim(), '', true, message.message_id);
          return;
      }

      if (args[2].trim().toLowerCase() === "camera") {
        const key = args[3].trim();
        const {description} = await getDescriptionByKey(key);

        await sendTrafficPhoto(chatId, {
          key, description,
        });
        return;
      }

    } else {
      await regionMenu(chatId, true, message.message_id);
      return;
    }

    return;
}

module.exports = {
  tdCam,
  tdCamCallback,
};
