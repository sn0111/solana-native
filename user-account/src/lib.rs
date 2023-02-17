use processor::processor;
use solana_program::entrypoint;

pub mod processor;
pub mod state;
pub mod instruction;

entrypoint!(processor);