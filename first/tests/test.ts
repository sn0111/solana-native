import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { describe } from "mocha";
import { readFileSync } from 'fs';
import * as borsh from 'borsh'

function createKeypairFromFile(path:string):Keypair{
    return Keypair.fromSecretKey(
        Buffer.from(JSON.parse(readFileSync(path,"utf-8")))
    )
}

enum TranserType{
    CPI,
    Program
}



class Transer{
    type:TranserType

    constructor(props:{type:TranserType}){
        this.type=props.type
    }

    toBuffer(){
        return Buffer.from(borsh.serialize(TransferSchema,this))
    }
}

const TransferSchema = new Map([
    [Transer,{
        kind:'struct',
        fields:[
            ['type','u8']
        ]
    }]
])

describe("transfer-sol",()=>{
    const connection = new Connection("https://api.devnet.solana.com","confirmed");
    const payer = createKeypairFromFile("/home/sn/.config/solana/id.json");
    const from = createKeypairFromFile("/home/sn/wallets/RamvJ2q9mGWyQ3YyRH9LqzKPmjDbWuCxB9pVefFjwkc.json");
    const to = createKeypairFromFile("/home/sn/wallets/Sn8Qm8ucDXpMdUAuVFonk2kvs6fyqABab7K2gfQkJmg.json");
    const program = createKeypairFromFile("/home/sn/Documents/smart-contracts/first/target/deploy/first-keypair.json");
    const user = Keypair.generate()

    it("Send sol lamports to user using cpi transfer",async ()=>{
        const transfer = new Transer({type:TranserType.CPI})
        const ix = new TransactionInstruction({
            programId:program.publicKey,
            keys:[
                {pubkey:payer.publicKey,isSigner:true,isWritable:true},
                {pubkey:from.publicKey,isSigner:false,isWritable:true},
                // {pubkey:to.publicKey,isSigner:false,isWritable:true},
                {pubkey:SystemProgram.programId,isSigner:false,isWritable:false},
            ],
            data:transfer.toBuffer()
        })
    
        await sendAndConfirmTransaction(
            connection,
            new Transaction().add(ix),
            [payer,from]
        )
    })

    it("Web3 transer sol", async () => {
        const ix = (pubkey: PublicKey) => {
            return SystemProgram.createAccount({
              fromPubkey: payer.publicKey,
              newAccountPubkey: pubkey,
              space: 0,
              lamports: 2 * LAMPORTS_PER_SOL,
              programId: SystemProgram.programId,
            })
          };

        await sendAndConfirmTransaction(
            connection,
            new Transaction().add(ix(user.publicKey)),
            [payer,user]
        )
    })
})