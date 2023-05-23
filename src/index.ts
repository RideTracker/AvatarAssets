import * as dotenv from "dotenv";
dotenv.config();

import fs from "fs";

import Client, { createAvatar, createAvatarColor, createAvatarImage, getAvatars, uploadImage } from "@ridetracker/avatarclient";
import { Manifest } from "./models/Manifest";

const client = new Client(process.env.AVATAR_API_URL, process.env.AVATAR_API_TOKEN);

const args = process.argv.filter((_, index) => index > 1);

if(!args.length)
    throw new Error("Missing arguments, enter '-all' or specify avatar by type/name, e.g. heads/female1");

async function uploadAvatar(folder: string, name: string) {
    console.log(`Processing ${name}...`);

    const manifest: Manifest = JSON.parse(fs.readFileSync(`./assets/${folder}/${name}/manifest.json`, "utf8"));

    console.log(`Creating ${name}...`);

    const avatarResult = await createAvatar(client, name, manifest.type);

    if(!avatarResult.success)
        throw new Error(`Failed to create avatar ${name}.`);

    console.log(`Uploading ${name}...`);

    const avatarUploadResult = await uploadImage(avatarResult.uploadUrl, `${name}.png`, "image/png", fs.readFileSync(`./assets/${folder}/${name}/preview.png`));

    if(!avatarUploadResult.success)
        throw new Error(`Failed to upload avatar ${name}.`);
    
    const layers = fs.readdirSync(`./assets/${folder}/${name}/layers/`);

    for(let layer of layers) {
        const index = parseInt(layer.substring("layer_".length, layer.indexOf('.')));

        const layerSettings = manifest.layers.find((_layer) => _layer.index === index);

        console.log(`Creating ${name} image ${index}...`);

        const avatarLayerResult = await createAvatarImage(client, avatarResult.avatar.id, index, layerSettings?.colorType);

        if(!avatarLayerResult.success)
            throw new Error(`Failed to create avatar ${name} layer ${index}.`);

        console.log(`Uploading ${name} image ${index}...`);

        const avatarUploadResult = await uploadImage(avatarLayerResult.uploadUrl, `${name}_layer_${index}.png`, "image/png", fs.readFileSync(`./assets/${folder}/${name}/layers/layer_${index}.png`));

        if(!avatarUploadResult.success)
            throw new Error(`Failed to upload avatar ${name} layer ${index}.`);
    }

    for(let index = 0; index < manifest.colors.length; index++) {
        console.log(`Creating ${name} color type ${manifest.colors[index].type}...`);

        const colorResult = await createAvatarColor(client, avatarResult.avatar.id, manifest.colors[index].type, index, manifest.colors[index].defaultColor);

        if(!colorResult.success)
            throw new Error(`Failed to create avatar ${name} color type ${manifest.colors[index].type}.`);
    }
};

(async () => {
    if(args.includes("-all")) {
        const folders = fs.readdirSync("./assets/");
    
        for(let folder of folders) {
            if(folder.includes('.'))
                continue;
    
            const names = fs.readdirSync(`./assets/${folder}/`);
    
            for(let name of names) {
                await uploadAvatar(folder, name);
            }
        }
    }
    else {
        for(let argument of args) {
            const [ folder, name ] = argument.split('/');
            
            await uploadAvatar(folder, name);
        }
    }
})();
