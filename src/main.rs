use clap::{App, Arg};

mod transcode;

fn main() {
    let matches = App::new("Tidal")
        .version("0.1")
        .about("The tidal CLI is used for distributed video processing")
        .author("Brendan Kennedy <brendan@bken.io>")
        .subcommand(
            App::new("transcode")
                .about("transcode a segment")
                .arg(
                    Arg::with_name("source")
                        .short('s')
                        .long("source")
                        .about("the source of the file, should be in the format s3://")
                        .takes_value(true)
                        .required(true),
                )
                .arg(
                    Arg::with_name("destination")
                        .short('d')
                        .long("destination")
                        .about("the destination of the file, should be in the format s3://")
                        .takes_value(true)
                        .required(true),
                )
                .arg(
                    Arg::with_name("command")
                        .short('c')
                        .long("command")
                        .about("the ffmpeg command to run on the source file")
                        .takes_value(true)
                        .required(true),
                ),
        )
        .get_matches();

    if let Some(matches) = matches.subcommand_matches("transcode") {
        let source = matches.value_of("source").unwrap();
        let command = matches.value_of("command").unwrap();
        let destination = matches.value_of("destination").unwrap();

        transcode::main(source, destination, command);
    }
}
