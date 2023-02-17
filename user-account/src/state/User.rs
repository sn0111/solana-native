use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{program_error::ProgramError, entrypoint::ProgramResult, account_info::AccountInfo, pubkey::Pubkey,msg};

use crate::{processor::processor, instruction::{create_user, create_user_with_seeds}};

#[derive(BorshDeserialize,BorshSerialize,Debug)]
pub struct UserInfo{
    pub username:String,
    pub useremail:String,
    pub address:String,
    pub gender:String,
    pub dob:String,
    pub age:u8,
}

impl UserInfo{
    pub fn unpack(input:&[u8],accounts:&[AccountInfo],programId:&Pubkey) -> ProgramResult{
        let (&tag,rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;
        match tag {
            0=>{
                msg!("User account is creating without seeds");
                if let Ok(userInfo) = UserInfo::try_from_slice(rest){
                    create_user(programId, accounts, &userInfo);
                }
            },
            _=>{
                msg!("User account is creating with seeds");
                if let Ok(userInfo) = UserInfo::try_from_slice(rest){
                    create_user_with_seeds(programId, accounts, &userInfo);
                }
            }
        }
        Ok(())
    }
}