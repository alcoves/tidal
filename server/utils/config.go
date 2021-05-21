package utils

import (
	"fmt"
	"log"

	"github.com/spf13/viper"
)

// ViperConfig holds the environement variables tidal depends on
type ViperConfig struct {
	TidalDir     string `mapstructure:"TIDAL_DIR"`
	NomadToken   string `mapstructure:"NOMAD_TOKEN"`
	TidalTmpDir  string `mapstructure:"TIDAL_TMP_DIR"`
	RcloneConfig string `mapstructure:"RCLONE_CONFIG"`
}

// Config is a global config in memory, be careful
var Config = &ViperConfig{}

// LoadConfig reads configuration from file or environment variables.
func LoadConfig(path string) *ViperConfig {
	fmt.Println("Loading env file from", path)
	viper.AddConfigPath(path)
	viper.SetConfigName("tidal")
	viper.SetConfigType("env")
	viper.AutomaticEnv()

	err := viper.ReadInConfig()
	if err != nil {
		log.Fatal(err)
	}

	err = viper.Unmarshal(&Config)
	if err != nil {
		log.Fatal(err)
	}

	return Config
}
