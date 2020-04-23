extern crate clap;
extern crate dotenv;

use clap::{App, Arg};
use dotenv::dotenv;
// use std::env;

mod concat;
mod segment;

fn main() {
  dotenv().ok();

  // for (key, value) in env::vars() {
  //     println!("{}: {}", key, value);
  // }

  let matches = App::new("Tidal Distributed Video Transcoder")
    .version("0.1.0")
    .author("Brendan Kennedy <brenwken@gmail.com>")
    .about("fast video transcoder written in rust")
    .arg(
      Arg::with_name("mode")
        .short('m')
        .long("mode")
        .takes_value(true)
        .help("One of segment, transcode, or concat"),
    )
    .arg(
      Arg::with_name("in")
        .short('i')
        .long("in")
        .takes_value(true)
        .help("Path to source"),
    )
    .arg(
      Arg::with_name("out")
        .short('o')
        .long("out")
        .takes_value(true)
        .help("Path to destination"),
    )
    .get_matches();

  println!("{:?}", matches);

  let mode = matches.value_of("mode");

  match mode {
    Some("segment") => segment::run(matches),
    Some("concat") => concat::run(matches),
    _ => println!("invalid mode: {}", mode.unwrap()),
  }
}
