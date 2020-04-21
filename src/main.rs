extern crate clap;

use clap::{Arg, App};

mod segment;
mod concat;

fn main() {
    let matches = App::new("Tidal Distributed Video Transcoder")
        .version("0.1.0")
        .author("Brendan Kennedy <brenwken@gmail.com>")
        .about("fast video transcoder written in rust")
        .arg(Arg::with_name("mode")
            .short('m')
            .long("mode")
            .takes_value(true)
            .help("One of segment, transcode, or concat"))
        .arg(Arg::with_name("id")
            .long("id")
            .takes_value(true)
            .help("The id of the video file"))
        .get_matches();

    println!("{:?}", matches);

    let mode = matches.value_of("mode");

    match mode {
        Some("segment") => segment::run(matches),
        Some("concat") => concat::run(matches),
        _ => println!("invalid mode: {}", mode.unwrap())
    }

    // if mode == "segment" {
    //     segment::run(matches);
    // } else if mode == "concatinate" {
    //     concatinate::run(matches);
    // }
}
