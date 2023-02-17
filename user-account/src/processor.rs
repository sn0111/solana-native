use borsh::BorshDeserialize;
use solana_program::{pubkey::Pubkey, account_info::AccountInfo, entrypoint::ProgramResult};

use crate::state::UserInfo;



pub fn processor(
    programId:&Pubkey,
    accounts:&[AccountInfo],
    data:&[u8]
) ->ProgramResult{
    
    UserInfo::unpack(data, accounts, programId)
}