begin;
lock table public.students in share row exclusive mode;

with ranked as (
  select id, order_number, created_at,
    row_number() over (partition by order_number order by created_at nulls last, id) as position
  from public.students
), reassign as (
  select id, order_number as old_order,
    (select coalesce(max(order_number), 0) from public.students)
      + row_number() over (order by order_number, created_at nulls last, id) as new_order
  from ranked
  where position > 1
)
update public.students as student
set order_number = reassign.new_order
from reassign
where student.id = reassign.id
returning reassign.old_order, student.order_number as new_order;

create unique index if not exists students_order_number_key
  on public.students (order_number);

create or replace function public.assign_student_order_number()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(618, 1);

  if tg_op = 'INSERT' and new.order_number is null then
    select coalesce(max(order_number), 0) + 1
      into new.order_number
      from public.students;
  end if;

  return new;
end;
$$;

create or replace trigger assign_student_order_number
before insert or update of order_number on public.students
for each row execute function public.assign_student_order_number();

commit;
