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

class UserInfo extends Assignable{


    toBuffer(){
        return Buffer.from(borsh.serialize(UserInfoSchema,this))
    }

    static fromBuffer(buffer:Buffer){
        return borsh.deserialize(UserInfoSchema,UserInfo,buffer)
    }
}

const UserInfoSchema = new Map([
    [UserInfo,{
        kind:'struct',
        fields:[
            ['username','string'],
            ['useremail','string'],
            ['address','string'],
            ['gender','string'],
            ['dob','string'],
            ['age','u8'],
        ]
    }]
])

describe("transfer-sol",async ()=>{
    const connection = new Connection("https://api.devnet.solana.com","confirmed");
    const payer = createKeypairFromFile("/home/sn/.config/solana/id.json");
    const from = createKeypairFromFile("/home/sn/wallets/RamvJ2q9mGWyQ3YyRH9LqzKPmjDbWuCxB9pVefFjwkc.json");
    const to = createKeypairFromFile("/home/sn/wallets/Sn8Qm8ucDXpMdUAuVFonk2kvs6fyqABab7K2gfQkJmg.json");
    const program = createKeypairFromFile("/home/sn/Documents/smart-contracts/user-account/target/deploy/user_account-keypair.json");
    const userKeyPair = Keypair.generate()
    const userAccount = (await PublicKey.findProgramAddress(
        [Buffer.from("user-info"),from.publicKey.toBytes()],
        program.publicKey
    ))[0]
    it("Creating account with seeds",async ()=>{
        const user = new UserInfo({
            username:'From',
            useremail:'from@gmail.com',
            address:"Kakinada",
            gender:"Male",
            dob:"20-20-2000",
            age:21
        })

        const ix = new TransactionInstruction({
            programId:program.publicKey,
            keys:[
                {pubkey:from.publicKey,isSigner:true,isWritable:true},
                {pubkey:userAccount,isSigner:false,isWritable:true},
                // {pubkey:to.publicKey,isSigner:false,isWritable:true},
                {pubkey:SystemProgram.programId,isSigner:false,isWritable:false},
            ],
            data:Buffer.concat([Buffer.of(1),user.toBuffer()])
        })
    
        await sendAndConfirmTransaction(
            connection,
            new Transaction().add(ix),
            [from]
        )
    })

    it("Creating account without seeds", async () => {
        const user = new UserInfo({
            username:'Sairam',
            useremail:'sai@gmail.com',
            address:"Kakinada",
            gender:"Male",
            dob:"20-20-2000",
            age:21
        })
        const ix = new TransactionInstruction({
            programId:program.publicKey,
            keys:[
                {pubkey:payer.publicKey,isSigner:true,isWritable:true},
                {pubkey:userKeyPair.publicKey,isSigner:true,isWritable:true},
                // {pubkey:to.publicKey,isSigner:false,isWritable:true},
                {pubkey:SystemProgram.programId,isSigner:false,isWritable:false},
            ],
            data:Buffer.concat([Buffer.of(0),user.toBuffer()])
        })
        await sendAndConfirmTransaction(
            connection,
            new Transaction().add(ix),
            [payer,userKeyPair]
        )
    })

    it("Seed Account data call", async ()=>{
        let account = await connection.getAccountInfo(userAccount);
        let user = UserInfo.fromBuffer(account.data)
        console.log(user);
    })

    it("Account data call", async ()=>{
        let account = await connection.getAccountInfo(userKeyPair.publicKey);
        let user = UserInfo.fromBuffer(account.data)
        console.log(user);
    })
})