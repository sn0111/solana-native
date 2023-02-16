use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    entrypoint,
    entrypoint:: ProgramResult,
    pubkey::Pubkey, 
    account_info::{AccountInfo, next_account_info}, program::invoke, syscalls, system_instruction,msg
};

entrypoint!(process_entrypoint);

#[derive(Debug,BorshDeserialize,BorshSerialize)]
pub enum TranferType {
    CPI,
    Program
}

pub fn cpi(accounts:&[AccountInfo])->ProgramResult{
    msg!("Cpi Transfer method called");
    let account_iter = &mut accounts.iter();
    // let payer = next_account_info(account_iter)?;
    let from = next_account_info(account_iter)?;
    let to = next_account_info(account_iter)?;
    let system_program = next_account_info(account_iter)?;

    invoke(
        &system_instruction::transfer(&from.key, &to.key, 1), 
        &[from.clone(),to.clone(),system_program.clone()]
    )?;
    Ok(())
}

pub fn program(accounts:&[AccountInfo])->ProgramResult{
    msg!("Program Transfer method called");
    let account_iter = &mut accounts.iter();
    // let payer = next_account_info(account_iter)?;
    let from = next_account_info(account_iter)?;
    let to = next_account_info(account_iter)?;
    let amount:u64 = 1;
    **from.try_borrow_mut_lamports()? -=amount;
    **to.try_borrow_mut_lamports()? +=amount;

    Ok(())
}

pub fn process_entrypoint(
    _program_id:&Pubkey,
    accounts:&[AccountInfo],
    instruction_data:&[u8]
)->ProgramResult {

    let transertype = TranferType::try_from_slice(&instruction_data)?;
    match transertype {
        TranferType::CPI=>cpi(accounts),
        TranferType::Program=>program(accounts)
    }

    // Ok(())

}

#[cfg(test)]
mod tests {
    use super::*;

}
