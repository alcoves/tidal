extern crate clap;
extern crate dotenv;

use clap::{App, Arg};
use dotenv::dotenv;

mod concat;
mod segment;

fn main() {
  dotenv().ok();

  let matches = App::new("Tidal Distributed Video Transcoder")
    .version("0.1.0")
    .author("Brendan Kennedy <brenwken@gmail.com>")
    .about("video transcoder written in rust")
    .arg(Arg::with_name("mode").index(1).required(true))
    .arg(
      Arg::with_name("video_id")
        .required(true)
        .takes_value(true)
        .long("video_id")
    )
    .arg(
      Arg::with_name("bucket_name")
        .short('b')
        .required(true)
        .takes_value(true)
        .long("bucket_name")
    )
    .arg(
      Arg::with_name("filename")
        .takes_value(true)
        .long("filename")
    )
    .arg(
      Arg::with_name("preset")
        .takes_value(true)
        .long("preset")
    )
    .arg(
      Arg::with_name("transcode_queue_url")
        .takes_value(true)
        .long("transcode_queue_url")
    )
    .get_matches();

  let mode = matches.value_of("mode");

  match mode {
    Some("segment") => {
      println!("Segmentation Mode");
      segment::run(matches)
    }
    Some("concat") => {
      println!("Concatination Mode");
      concat::run(matches)
    }
    _ => println!("invalid mode: {}", mode.unwrap()),
  }
}
