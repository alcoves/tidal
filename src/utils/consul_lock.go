package utils

import (
	"log"

	consulapi "github.com/hashicorp/consul/api"
)

// Lock stores data for a consul lock
type Lock struct {
	Path       string
	consulLock *consulapi.Lock
	Chan       <-chan struct{}
}

// NewLock creates a new consul lock object for path
func NewLock(path string) (*Lock, error) {
	var err error
	var consul *consulapi.Client
	config := consulapi.DefaultConfig()
	config.Address = "127.0.0.1:8500"
	if consul, err = consulapi.NewClient(config); err != nil {
		return nil, err
	}
	l := new(Lock)
	l.Path = path
	if l.consulLock, err = consul.LockKey(path); err != nil {
		return nil, err
	}
	return l, nil
}

// Lock attempts to lock the consul key
func (l *Lock) Lock() (err error) {
	log.Println("Trying to get consul lock")
	if l.Chan, err = l.consulLock.Lock(nil); err != nil {
		return err
	}
	log.Println("Lock acquired")
	return
}

// Unlock releases the consul lock being held
func (l *Lock) Unlock() {
	log.Println("Releasing consul lock")
	l.consulLock.Unlock()
}
