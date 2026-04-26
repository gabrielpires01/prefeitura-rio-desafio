package service

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"

	"github.com/prefeiturario/painel-social/internal/cache"
	"github.com/prefeiturario/painel-social/internal/domain"
	"github.com/prefeiturario/painel-social/internal/repository"
)

var ErrNotFound = errors.New("não encontrado")

const (
	ttlSummary  = 10 * time.Minute
	ttlList     = 2 * time.Minute
	ttlChild    = 15 * time.Minute
	keySummary  = "summary"
	keyChildFmt = "children:id:%s"
	keyListFmt  = "children:list:bairro=%s&com_alertas=%s&revisado=%s&page=%d&page_size=%d"
	patternList = "children:list:*"
)

type ChildService struct {
	repo  repository.ChildRepositorier
	cache cache.Cacher
}

func NewChildService(repo repository.ChildRepositorier, c cache.Cacher) *ChildService {
	return &ChildService{repo: repo, cache: c}
}

func (s *ChildService) List(params domain.ChildListParams) (*domain.ChildListResult, error) {
	if params.Page < 1 {
		params.Page = 1
	}
	if params.PageSize < 1 || params.PageSize > 100 {
		params.PageSize = 20
	}

	key := fmt.Sprintf(keyListFmt,
		params.Bairro,
		boolPtrStr(params.ComAlertas),
		boolPtrStr(params.Revisado),
		params.Page,
		params.PageSize,
	)

	var result domain.ChildListResult
	if err := s.cache.Get(context.Background(), key, &result); err == nil {
		return &result, nil
	}

	res, err := s.repo.List(params)
	if err != nil {
		return nil, err
	}

	if setErr := s.cache.Set(context.Background(), key, res, ttlList); setErr != nil {
		log.Printf("cache set %s: %v", key, setErr)
	}
	return res, nil
}

func (s *ChildService) GetByID(id string) (*domain.Child, error) {
	key := fmt.Sprintf(keyChildFmt, id)

	var child domain.Child
	if err := s.cache.Get(context.Background(), key, &child); err == nil {
		return &child, nil
	}

	c, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if c == nil {
		return nil, ErrNotFound
	}

	if setErr := s.cache.Set(context.Background(), key, c, ttlChild); setErr != nil {
		log.Printf("cache set %s: %v", key, setErr)
	}
	return c, nil
}

func (s *ChildService) MarkReviewed(id, reviewer string) error {
	err := s.repo.MarkReviewed(id, reviewer)
	if errors.Is(err, sql.ErrNoRows) || errors.Is(err, gorm.ErrRecordNotFound) {
		return ErrNotFound
	}
	if err != nil {
		return err
	}

	ctx := context.Background()
	if delErr := s.cache.Delete(ctx, keySummary, fmt.Sprintf(keyChildFmt, id)); delErr != nil {
		log.Printf("cache delete after review: %v", delErr)
	}
	if delErr := s.cache.DeleteByPattern(ctx, patternList); delErr != nil {
		log.Printf("cache delete list pattern after review: %v", delErr)
	}
	return nil
}

func (s *ChildService) Summary() (*domain.Summary, error) {
	var summary domain.Summary
	if err := s.cache.Get(context.Background(), keySummary, &summary); err == nil {
		return &summary, nil
	}

	res, err := s.repo.Summary()
	if err != nil {
		return nil, err
	}

	if setErr := s.cache.Set(context.Background(), keySummary, res, ttlSummary); setErr != nil {
		log.Printf("cache set %s: %v", keySummary, setErr)
	}
	return res, nil
}

func boolPtrStr(b *bool) string {
	if b == nil {
		return "nil"
	}
	if *b {
		return "true"
	}
	return "false"
}
