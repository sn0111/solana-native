import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js";
import { describe } from "mocha";
import { readFileSync } from 'fs';
import * as borsh from 'borsh'
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

function createKeypairFromFile(path:string):Keypair{
    return Keypair.fromSecretKey(
        Buffer.from(JSON.parse(readFileSync(path,"utf-8")))
    )
}

describe("transfer-sol",async ()=>{
    const connection = new Connection("https://api.devnet.solana.com","confirmed");
    const payer = createKeypairFromFile("/home/sn/.config/solana/id.json");
    // const from = createKeypairFromFile("/home/sn/wallets/RamvJ2q9mGWyQ3YyRH9LqzKPmjDbWuCxB9pVefFjwkc.json");
    // const to = createKeypairFromFile("/home/sn/wallets/Sn8Qm8ucDXpMdUAuVFonk2kvs6fyqABab7K2gfQkJmg.json");
    const program = createKeypairFromFile("/home/sn/Documents/smart-contracts/nft-mint/target/deploy/nft_mint-keypair.json");
    const mintAccount = Keypair.generate()
    console.log(mintAccount.publicKey.toBase58())

    const tokenAddress = await getAssociatedTokenAddress(
        mintAccount.publicKey,
        payer.publicKey
      );
    console.log(tokenAddress.toBase58())

    it("Creating mint account",async ()=>{
        const ix = new TransactionInstruction({
            programId:program.publicKey,
            keys:[
                {pubkey:mintAccount.publicKey,isSigner:true,isWritable:true},
                {pubkey:tokenAddress,isSigner:false,isWritable:true},
                {pubkey:payer.publicKey,isSigner:true,isWritable:false},
                {pubkey:SystemProgram.programId,isSigner:false,isWritable:false},
                {pubkey:TOKEN_PROGRAM_ID,isSigner:false,isWritable:false},
                {pubkey:SYSVAR_RENT_PUBKEY,isSigner:false,isWritable:false},
                {pubkey:ASSOCIATED_TOKEN_PROGRAM_ID,isSigner:false,isWritable:false},

            ],
            data:Buffer.of(0)
        })
    
        await sendAndConfirmTransaction(
            connection,
            new Transaction().add(ix),
            [payer,mintAccount]
        )
    })

})