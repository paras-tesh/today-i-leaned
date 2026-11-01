-- Lets the cart check a coupon without exposing the coupons table.
-- Returns the discount percent, or null when the code is unknown, inactive or expired.

create function public.apply_coupon(coupon_code text)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select percent
  from public.coupons
  where code = upper(trim(coupon_code))
    and active
    and (expires_at is null or expires_at > now());
$$;

grant execute on function public.apply_coupon(text) to anon, authenticated;

insert into public.coupons (code, percent) values ('RAZ20', 20), ('SKY10', 10)
on conflict (code) do nothing;
