package main

import "github.com/gofiber/fiber/v2"

func main() {
	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})

	app.Get("/config", func(c *fiber.Ctx) error {
		return c.SendString("Here is the config")
	})

	app.Patch("/config", func(c *fiber.Ctx) error {
		return c.SendString("modyfying the config")
	})

	app.Post("/jobs", func(c *fiber.Ctx) error {
		return c.SendString("creating a new one shot job")
	})
	
	app.Get("/jobs", func(c *fiber.Ctx) error {
		return c.SendString("list jobs")
	})

	app.Get("/jobs/:id", func(c *fiber.Ctx) error {
		return c.SendString("getting job information")
	})

	app.Post("/jobs/:id/segment", func(c *fiber.Ctx) error {
		return c.SendString("segmenting")
	})

	app.Post("/jobs/audio", func(c *fiber.Ctx) error {
		return c.SendString("segmenting")
	})

	app.Post("/jobs/thumbnail", func(c *fiber.Ctx) error {
		return c.SendString("segmenting")
	})

	app.Post("/jobs/:id/transcode/:segment ", func(c *fiber.Ctx) error {
		return c.SendString("segmenting")
	})

	app.Post("/jobs/:id/:preset/concatinate", func(c *fiber.Ctx) error {
		return c.SendString("segmenting")
	})

	app.Post("/jobs/:id/package", func(c *fiber.Ctx) error {
		return c.SendString("segmenting")
	})

	app.Post("/jobs/:id/package", func(c *fiber.Ctx) error {
		return c.SendString("segmenting")
	})


	app.Listen(":3000")
}
