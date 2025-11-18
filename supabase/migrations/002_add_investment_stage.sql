-- ==========================================
-- MatchUp 스키마 업데이트: 투자 상태 필드 추가
-- SQL Editor에서 실행하세요
-- ==========================================

-- projects 테이블에 investment_stage 컬럼 추가
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS investment_stage VARCHAR(20) DEFAULT NULL;

-- 투자 상태 값: 'seed', 'series_a', 'series_b', 'series_c', NULL(미정)

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_projects_investment_stage ON projects (investment_stage);

-- 코멘트 추가
COMMENT ON COLUMN projects.investment_stage IS '투자 상태: seed, series_a, series_b, series_c';

-- 샘플 데이터 업데이트
UPDATE projects SET investment_stage = 'seed' WHERE id = 'b0000000-0000-0000-0000-000000000001';
UPDATE projects SET investment_stage = 'series_a' WHERE id = 'b0000000-0000-0000-0000-000000000002';
UPDATE projects SET investment_stage = 'series_b' WHERE id = 'b0000000-0000-0000-0000-000000000003';

SELECT '투자 상태 필드 추가 완료!' as result;
