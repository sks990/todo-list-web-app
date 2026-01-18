-- 비즈니스 규칙에 따른 DB 제약 조건 강화
ALTER TABLE public.profiles
ADD CONSTRAINT display_name_length_check 
CHECK (char_length(display_name) >= 2 AND char_length(display_name) <= 20);

ALTER TABLE public.profiles
ADD CONSTRAINT bio_length_check 
CHECK (char_length(bio) <= 160);