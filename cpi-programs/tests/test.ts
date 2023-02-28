import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { describe } from "mocha";
import { readFileSync } from 'fs';
import * as borsh from 'borsh'

function createKeypairFromFile(path:string):Keypair{
    return Keypair.fromSecretKey(
        Buffer.from(JSON.parse(readFileSync(path,"utf-8")))
    )
}

class Assignable {
    constructor(properties) {
      if (properties) {
        Object.keys(properties).map((key) => {
            return (this[key] = properties[key]);
        });
      }
    }
}

class Post extends Assignable{


    toBuffer(){
        return Buffer.from(borsh.serialize(PostSchema,this))
    }

    static fromBuffer(buffer:Buffer){
        return borsh.deserialize(PostSchema,Post,buffer)
    }
}

const PostSchema = new Map([
    [Post,{
        kind:'struct',
        fields:[
            ['title','string'],
            ['body','string'],
        ]
    }]
])

describe("transfer-sol",async ()=>{
    const connection = new Connection("https://api.devnet.solana.com","confirmed");
    const payer = createKeypairFromFile("/home/sn/.config/solana/id.json");
    // const from = createKeypairFromFile("/home/sn/wallets/RamvJ2q9mGWyQ3YyRH9LqzKPmjDbWuCxB9pVefFjwkc.json");
    // const to = createKeypairFromFile("/home/sn/wallets/Sn8Qm8ucDXpMdUAuVFonk2kvs6fyqABab7K2gfQkJmg.json");
    const program = createKeypairFromFile("/home/sn/Documents/smart-contracts/cpi-programs/post/target/deploy/post-keypair.json");
    const callee = createKeypairFromFile("/home/sn/Documents/smart-contracts/cpi-programs/calle/target/deploy/calle-keypair.json");
    const userKeyPair = Keypair.generate()

    it("Creating post", async () => {
        const post = new Post({
            title:'My first post',
            body:'Today i brought a new mobile',
        })
        const ix = new TransactionInstruction({
            programId:program.publicKey,
            keys:[
                {pubkey:payer.publicKey,isSigner:true,isWritable:true},
                {pubkey:userKeyPair.publicKey,isSigner:true,isWritable:true},
                // {pubkey:to.publicKey,isSigner:false,isWritable:true},
                {pubkey:SystemProgram.programId,isSigner:false,isWritable:false},
            ],
            data:Buffer.concat([Buffer.of(0),post.toBuffer()])
        })
        await sendAndConfirmTransaction(
            connection,
            new Transaction().add(ix),
            [payer,userKeyPair]
        )
    })

    it("Updating post", async () => {
        const post = new Post({
            title:'My first post update',
            body:'Today I brought a new mobile',
        })
        const ix = new TransactionInstruction({
            programId:program.publicKey,
            keys:[
                {pubkey:userKeyPair.publicKey,isSigner:true,isWritable:true},
            ],
            data:Buffer.concat([Buffer.of(1),post.toBuffer()])
        })
        await sendAndConfirmTransaction(
            connection,
            new Transaction().add(ix),
            [payer,userKeyPair]
        )
    })

    it("Callee post", async () => {
        const post = new Post({
            title:'Cpi call test',
            body:'Today I brought a new mobile',
        })
        const ix = new TransactionInstruction({
            programId:callee.publicKey,
            keys:[
                {pubkey:userKeyPair.publicKey,isSigner:true,isWritable:true},
                {pubkey:program.publicKey,isSigner:false,isWritable:false},
            ],
            data:Buffer.concat([Buffer.of(1),post.toBuffer()])
        })
        await sendAndConfirmTransaction(
            connection,
            new Transaction().add(ix),
            [payer,userKeyPair]
        )
    })

    it("Account data call", async ()=>{
        let account = await connection.getAccountInfo(userKeyPair.publicKey);
        // let post = Post.fromBuffer(account.data)
        console.log(account);
    })
})