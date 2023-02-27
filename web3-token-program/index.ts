import { createAccount, createAssociatedTokenAccount, createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import { readFileSync } from "fs";

const createKeyPairFromFile = (loc:string):Keypair =>{
    return Keypair.fromSecretKey( Buffer.from(JSON.parse(readFileSync(loc,'utf-8'))))
}

const index =async ()=>{
    const payer = createKeyPairFromFile("/home/sn/.config/solana/id.json")
    const mintKeyPair = createKeyPairFromFile("/home/sn/wallets/TkM4YUC6nAbiLu4jHHRvxE3mhCh8gkeFpvFWmLYisSd.json")
    const accountKeyPair = createKeyPairFromFile("/home/sn/wallets/TkA4z3m2qXHLSfutwZ3bkXoTLv7s8BMmZdYoCvrtALK.json")
    
    let connection = new Connection(clusterApiUrl('devnet'))
    const tokenMint = await createMint(connection,payer,payer.publicKey,payer.publicKey,9,mintKeyPair)
    // console.log(tokenMint.toBase58())
    // const tokenAccount = await createAccount(connection,payer,mintKeyPair.publicKey,payer.publicKey,accountKeyPair)
    // console.log(tokenAccount.toBase58())

    const associatedTokeAccount = await getOrCreateAssociatedTokenAccount(connection,payer,mintKeyPair.publicKey,payer.publicKey)
    console.log(associatedTokeAccount.address.toBase58())

    // const mint = await mintTo(connection,payer,mintKeyPair.publicKey,accountKeyPair.publicKey,payer.publicKey,3*10**9)
    // console.log(mint)

    const source = new PublicKey("2zqmpYGj82h297fuHDUPUzpjiMEVwHdqCMyYehJqoqfh")

    const transfertoOther = await transfer(connection,payer,accountKeyPair.publicKey,source,payer,3*10**9)
    console.log(transfertoOther)
}

index()