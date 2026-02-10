-- Migration: Create plans (class bundles) tables
-- Purpose: Enable studios to create plans that bundle classes with quantities and pricing
-- Affected: New tables plans, plan_items, plan_benefits

-- plans: class bundle definition (membership or single payment)
create table if not exists plans (
  id bigserial primary key,
  studio_id bigint not null references studios(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  payment_type text not null check (payment_type in ('membership', 'single')),
  price numeric(10, 2) not null check (price >= 0),
  currency text not null default 'MNT',
  billing_period_months integer check (billing_period_months is null or billing_period_months in (1, 3, 12)),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- plan_items: classes included in a plan with quantity
create table if not exists plan_items (
  id bigserial primary key,
  plan_id bigint not null references plans(id) on delete cascade,
  class_id bigint not null references classes(id) on delete cascade,
  quantity integer not null check (quantity > 0)
);

-- plan_benefits: optional text benefits for a plan
create table if not exists plan_benefits (
  id bigserial primary key,
  plan_id bigint not null references plans(id) on delete cascade,
  benefit_text text not null,
  sort_order integer not null default 0
);

-- indexes
create index if not exists idx_plans_studio_id on plans(studio_id);
create index if not exists idx_plans_is_active on plans(is_active);
create index if not exists idx_plan_items_plan_id on plan_items(plan_id);
create index if not exists idx_plan_items_class_id on plan_items(class_id);
create index if not exists idx_plan_benefits_plan_id on plan_benefits(plan_id);

-- trigger for plans.updated_at
create trigger update_plans_updated_at
  before update on plans
  for each row
  execute function update_updated_at_column();

-- row level security
alter table plans enable row level security;
alter table plan_items enable row level security;
alter table plan_benefits enable row level security;

-- plans: studio owners can crud their own plans
create policy "Studio owners can view their own plans"
  on plans for select
  to authenticated
  using (
    exists (
      select 1 from studios
      where studios.id = plans.studio_id
      and studios.owner_id = (select auth.uid())
    )
  );

create policy "Studio owners can create their own plans"
  on plans for insert
  to authenticated
  with check (
    exists (
      select 1 from studios
      where studios.id = plans.studio_id
      and studios.owner_id = (select auth.uid())
    )
  );

create policy "Studio owners can update their own plans"
  on plans for update
  to authenticated
  using (
    exists (
      select 1 from studios
      where studios.id = plans.studio_id
      and studios.owner_id = (select auth.uid())
    )
  );

create policy "Studio owners can delete their own plans"
  on plans for delete
  to authenticated
  using (
    exists (
      select 1 from studios
      where studios.id = plans.studio_id
      and studios.owner_id = (select auth.uid())
    )
  );

-- plan_items: access via plan ownership
create policy "Studio owners can view plan items for their plans"
  on plan_items for select
  to authenticated
  using (
    exists (
      select 1 from plans
      join studios on studios.id = plans.studio_id
      where plans.id = plan_items.plan_id
      and studios.owner_id = (select auth.uid())
    )
  );

create policy "Studio owners can create plan items for their plans"
  on plan_items for insert
  to authenticated
  with check (
    exists (
      select 1 from plans
      join studios on studios.id = plans.studio_id
      where plans.id = plan_items.plan_id
      and studios.owner_id = (select auth.uid())
    )
  );

create policy "Studio owners can update plan items for their plans"
  on plan_items for update
  to authenticated
  using (
    exists (
      select 1 from plans
      join studios on studios.id = plans.studio_id
      where plans.id = plan_items.plan_id
      and studios.owner_id = (select auth.uid())
    )
  );

create policy "Studio owners can delete plan items for their plans"
  on plan_items for delete
  to authenticated
  using (
    exists (
      select 1 from plans
      join studios on studios.id = plans.studio_id
      where plans.id = plan_items.plan_id
      and studios.owner_id = (select auth.uid())
    )
  );

-- plan_benefits: access via plan ownership
create policy "Studio owners can view plan benefits for their plans"
  on plan_benefits for select
  to authenticated
  using (
    exists (
      select 1 from plans
      join studios on studios.id = plans.studio_id
      where plans.id = plan_benefits.plan_id
      and studios.owner_id = (select auth.uid())
    )
  );

create policy "Studio owners can create plan benefits for their plans"
  on plan_benefits for insert
  to authenticated
  with check (
    exists (
      select 1 from plans
      join studios on studios.id = plans.studio_id
      where plans.id = plan_benefits.plan_id
      and studios.owner_id = (select auth.uid())
    )
  );

create policy "Studio owners can update plan benefits for their plans"
  on plan_benefits for update
  to authenticated
  using (
    exists (
      select 1 from plans
      join studios on studios.id = plans.studio_id
      where plans.id = plan_benefits.plan_id
      and studios.owner_id = (select auth.uid())
    )
  );

create policy "Studio owners can delete plan benefits for their plans"
  on plan_benefits for delete
  to authenticated
  using (
    exists (
      select 1 from plans
      join studios on studios.id = plans.studio_id
      where plans.id = plan_benefits.plan_id
      and studios.owner_id = (select auth.uid())
    )
  );
