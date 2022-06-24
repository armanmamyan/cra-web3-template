//  Packages
const log = (content) => console.log(content);
const express = require("express");
const path = require('path');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
log('======================')
//  PORT
const PORT = process.env.PORT || 3001;
log('======================')
//  APP
const app = express();

// Configs
const merkleConfig = {
    sortPairs: true
};

const whitelistAddressList = [
    '0xB92CCc983DFdbB0E22303031d772513C7D5692b7',
    '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
    '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
    "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
    '0x1551AD0a4f658D3F66a55F1B6bAbac3300A81351'
];

// Variables
let leafNodeList;
let merkleTree;
let rootHash;

// Creating new array with hashing all whitelist addresses using keccak256
leafNodeList = whitelistAddressList.map(address => keccak256(address));

// Creating Merkle Tree algorithm using keccak256
merkleTree = new MerkleTree(leafNodeList, keccak256, merkleConfig);

// log merkleTree with toString() method to see the root hash
rootHash = merkleTree.getRoot();


app.get('/api/get-address-verification', (req, res) => {
    log('======================')
    const requestedAddress = req.query.address;
    console.log('Request Address', requestedAddress);
    log('======================')
    
    // Client Side: use msg.sender address to query and API that returns merkle proof hash required to derive the root hash of the MerkleTree
    const claimingAddress = leafNodeList[whitelistAddressList.indexOf(requestedAddress)];
    
    console.log('Leaf search Result', claimingAddress);
    log('======================')
    
    if(!claimingAddress) return res.status(406).send({ 
        message: "Your are not whitelisted",
        isVerified: false
    });
    
    // getHexProof returns the neighbour leaf and all parent nodes hashes that will
    // be required to derive the MerkleTree root hash of the
    const hexProof = merkleTree.getHexProof(claimingAddress);
    const isVerified = merkleTree.verify(hexProof,claimingAddress, rootHash);
    
    res.status(200).send({ 
        isVerified,
        message: "You're whitelisted. Click on Mint Button and claim your NFT",
    })
});


app.get('/api/get-address-proof', (req, res) => {
    const requestedAddress = req.query.address;
    
    // Client Side: use msg.sender address to query and API that returns merkle proof hash required to derive the root hash of the MerkleTree
    const claimingAddress = leafNodeList[whitelistAddressList.indexOf(requestedAddress)];
    
    if(!claimingAddress) return res.status(406).send({ 
        message: "Your are not whitelisted",
        proof: null,
        isVerified: false
    });
   
    // getHexProof returns the neighbour leaf and all parent nodes hashes that will
    // be required to derive the MerkleTree root hash of the
    
    const hexProof = merkleTree.getHexProof(claimingAddress);
    
    const verifiedAddress = merkleTree.verify(hexProof,claimingAddress, rootHash);
    const reformatVerifiedAddress = hexProof.map(item => item.replace(/["']/g, ""));
    
    
    res.send({ 
        proof: reformatVerifiedAddress,
        message: "You're whitelisted. Click on Mint Button and claim your NFT",
        verifiedAddress
    })
});

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));


app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});