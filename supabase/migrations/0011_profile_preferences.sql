-- App-inställningar per användare: tema och notiser (frontend-preferens,
-- ingen push-infrastruktur kopplad ännu).
alter table public.profiles
  add column theme_preference text not null default 'system'
    check (theme_preference in ('system', 'light', 'dark')),
  add column notifications_enabled boolean not null default false;
