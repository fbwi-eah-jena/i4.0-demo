"use strict";
const mfrc522 = require("./../index");
//# Init WiringPi with SPI Channel 0
mfrc522.initWiringPi(0);

//# This loop keeps checking for chips. If one is near it will get the UID and authenticate
console.log("scanning...");
console.log("Please put chip or keycard in the antenna inductive zone!");
console.log("Press Ctrl-C to stop.");

setInterval(function(){

    //# reset card
    mfrc522.reset();

    //# Scan for cards
    let response = mfrc522.findCard();
    if (!response.status) {
        console.log("No Card");
        return;
    }
    console.log("Card detected, CardType: " + response.bitSize);

	
	
    //# Get the UID of the card
    response = mfrc522.getUid();
    if (!response.status) {
        console.log("UID Scan Error");
        return;
    }
    //# If we have the UID, continue
    const uid = response.data;
    console.log("Card read UID: %s %s %s %s", uid[0].toString(16), uid[1].toString(16), uid[2].toString(16), uid[3].toString(16));

	
	
	
    //# Select the scanned card
    const memoryCapacity = mfrc522.selectCard(uid);
    console.log("Card Memory Capacity: " + memoryCapacity);

    //# This is the default key for authentication
    const key = [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF];

    //# Authenticate on Block 8 with key and uid
    if (!mfrc522.authenticate(8, key, uid)) {
        console.log("Authentication Error");
        return;
    }

    //# Dump Block 8
    console.log("Block: 8 Data: " + mfrc522.getDataForBlock(8));

    //# Stop
    mfrc522.stopCrypto();

}, 500);