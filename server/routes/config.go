package routes

import (
	"encoding/json"

	"github.com/gofiber/fiber/v2"
	"github.com/hashicorp/consul/api"
)

type Config struct {
	Key string `json:"Key"`
}

func getKv(key string) (*api.KVPair, error) {
	client, err := api.NewClient(api.DefaultConfig())
	if err != nil {
		return nil, err
	}

	kv := client.KV()
	pair, _, err := kv.Get(key, nil)
	if err != nil {
		return nil, err
	}

	return pair, err
}

func GetConfig(c *fiber.Ctx) error {
	kvGet, err := getKv("config")
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}

	config := Config{}
	json.Unmarshal([]byte(kvGet.Value), &config)
	return c.JSON(config)
}

func PutConfig(c *fiber.Ctx) error {
	client, err := api.NewClient(api.DefaultConfig())
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}

	newConfig := new(Config)
	if err := c.BodyParser(newConfig); err != nil {
		return c.Status(500).SendString(err.Error())
	}

	bytes, err := json.Marshal(newConfig)
	if err != nil {
		return c.Status(500).SendString("failed to marshal config")
	}

	kv := client.KV()
	p := &api.KVPair{Key: "config", Value: bytes}
	_, err = kv.Put(p, nil)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}

	kvGet, err := getKv("config")
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}

	config := Config{}
	json.Unmarshal([]byte(kvGet.Value), &config)
	return c.JSON(config)
}
