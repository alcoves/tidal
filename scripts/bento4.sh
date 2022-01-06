#!/bin/bash

git clone https://github.com/axiomatic-systems/Bento4.git
cd Bento4/

mkdir cmakebuild
cd cmakebuild/
cmake -DCMAKE_BUILD_TYPE=Release ..
make

# Or

wget https://www.bok.net/Bento4/binaries/Bento4-SDK-1-6-0-639.x86_64-unknown-linux.zip

unzip Bento4-SDK-1-6-0-639.x86_64-unknown-linux.zip

cp Bento4-SDK-1-6-0-639.x86_64-unknown-linux/* /usr/local/ -r