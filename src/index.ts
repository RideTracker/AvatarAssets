import * as dotenv from "dotenv";
dotenv.config();

import fs from "fs";

import Client, { getAvatars, ping } from "@ridetracker/avatarclient";

const client = new Client(process.env.AVATAR_API_URL, process.env.AVATAR_API_TOKEN);

getAvatars(client).then((response) => {
    console.log(response);
});

const args = process.argv.filter((_, index) => index > 1);

if(!args.length)
    throw new Error("Missing arguments, enter '-all' or specify avatar by type/name, e.g. heads/female1");

async function uploadAvatar(type: string, name: string) {
    const manifest = JSON.parse(fs.readFileSync(`../assets/${type}/${name}/manifest.json`, "utf8"));
};

if(args.includes("-all")) {
    const types = fs.readdirSync("../assets/");

    for(let type of types) {
        const names = fs.readdirSync(`../assets/${type}/`);

        for(let name of names) {
            uploadAvatar(type, name);
        }
    }
}
else {
    for(let argument of args) {
        const [ type, name ] = argument.split('/');
        
        uploadAvatar(type, name);
    }
}
