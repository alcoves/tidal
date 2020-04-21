mod segment;
mod concatinate;

use std::env;

// Tidal is invoked with cli commands for local dev
// In AWS, we expect TIDAL_CMD to be defined
// with the desired cli command to run

fn main() {
    let args: Vec<String> = env::args().collect();

    for argument in args.iter() {
        println!("{}", argument);
    }

    if args[1] == "segment" {
        segment::run(args);
    } else if args[2] == "concatinate" {
        concatinate::run(args);
    }
}
