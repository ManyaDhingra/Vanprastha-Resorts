$ErrorActionPreference = "Stop"
$base = "http://localhost:3000"
$json = "application/json"

function PostJson($path, $body, $headers = @{}) {
  $params = @{ Uri = "$base$path"; Method = "Post"; ContentType = $json; Body = ($body | ConvertTo-Json); TimeoutSec = 30 }
  if ($headers.Count -gt 0) { $params.Headers = $headers }
  return Invoke-RestMethod @params
}
function ExpectStatus($script, $expected, $label) {
  try {
    & $script | Out-Null
    $got = "200"
  } catch {
    $got = $_.Exception.Response.StatusCode.value__
  }
  $ok = ($got -eq $expected)
  Write-Host ("{0}: expected {1} got {2} => {3}" -f $label, $expected, $got, $(if ($ok) { "PASS" } else { "FAIL" }))
  if (-not $ok) { throw "Assertion failed: $label" }
}

# dates: tomorrow .. +3 days
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
$plus3 = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")
$roomId = (Invoke-RestMethod "$base/api/rooms" -TimeoutSec 30)[0].id

# --- register two users ---
$suffix = Get-Random -Maximum 999999
$uA = "userA$suffix@test.local"; $uB = "userB$suffix@test.local"
$regA = PostJson "/api/auth/register" @{ name = "User A"; email = $uA; password = "password123"; phone = "" }
$regB = PostJson "/api/auth/register" @{ name = "User B"; email = $uB; password = "password123"; phone = "" }
$tokA = $regA.token; $tokB = $regB.token
Write-Host "registered A=$uA B=$uB"

function AuthHeaders($tok) { return @{ Authorization = "Bearer $tok" } }

# --- me: valid + missing ---
$me = Invoke-RestMethod "$base/api/auth/me" -Headers (AuthHeaders $tokA) -TimeoutSec 30
Write-Host "me: $($me.user.email) OK"
ExpectStatus { Invoke-WebRequest "$base/api/auth/me" -UseBasicParsing -TimeoutSec 30 } "401" "me without token"

# --- bookings: no token -> 401 ---
ExpectStatus { Invoke-WebRequest "$base/api/bookings" -Method Post -ContentType $json -Body '{}' -UseBasicParsing -TimeoutSec 30 } "401" "create booking without token"

# --- create booking A ---
try {
  $created = PostJson "/api/bookings" @{ roomId = $roomId; checkIn = $tomorrow; checkOut = $plus3; guests = 2 } (AuthHeaders $tokA)
  $bid = $created.id
  Write-Host "booking created: $bid total=$($created.totalAmount) status=$($created.status)"
} catch { throw "create failed: $_" }

# --- overlap: same dates other user -> 409 ---
ExpectStatus { Invoke-WebRequest "$base/api/bookings" -Method Post -ContentType $json -Headers (AuthHeaders $tokB) -Body (@{ roomId = $roomId; checkIn = $tomorrow; checkOut = $plus3; guests = 2 } | ConvertTo-Json) -UseBasicParsing -TimeoutSec 30 } "409" "overlap rejected"

# --- availability false meanwhile ---
$avail = Invoke-RestMethod "$base/api/availability?roomId=$roomId&checkIn=$tomorrow&checkOut=$plus3" -TimeoutSec 30
Write-Host ("availability while booked: {0} => {1}" -f $avail.available, $(if ($avail.available -eq $false) { "PASS" } else { "FAIL" }))

# --- IDOR: B cannot read/delete A's booking ---
ExpectStatus { Invoke-WebRequest "$base/api/bookings/$bid" -Headers (AuthHeaders $tokB) -UseBasicParsing -TimeoutSec 30 } "404" "IDOR read B->A"
ExpectStatus { Invoke-WebRequest "$base/api/bookings/$bid" -Method Delete -Headers (AuthHeaders $tokB) -UseBasicParsing -TimeoutSec 30 } "404" "IDOR delete B->A"

# --- B cannot pay for A's booking ---
ExpectStatus { Invoke-WebRequest "$base/api/payment/create-order" -Method Post -ContentType $json -Headers (AuthHeaders $tokB) -Body (@{ bookingId = $bid } | ConvertTo-Json) -UseBasicParsing -TimeoutSec 30 } "403" "pay for others booking"

# --- payment unconfigured -> 503 honest ---
ExpectStatus { Invoke-WebRequest "$base/api/payment/create-order" -Method Post -ContentType $json -Headers (AuthHeaders $tokA) -Body (@{ bookingId = $bid } | ConvertTo-Json) -UseBasicParsing -TimeoutSec 30 } "503" "create-order without keys"

# --- A cancels (PENDING only) ---
$cancelled = Invoke-RestMethod "$base/api/bookings/$bid" -Method Delete -Headers (AuthHeaders $tokA) -TimeoutSec 30
Write-Host ("cancel: status={0} => {1}" -f $cancelled.status, $(if ($cancelled.status -eq "CANCELLED") { "PASS" } else { "FAIL" }))

# --- dates free again (B can book now) ---
$b2 = PostJson "/api/bookings" @{ roomId = $roomId; checkIn = $tomorrow; checkOut = $plus3; guests = 2 } (AuthHeaders $tokB)
Write-Host ("rebook after cancel: id={0} => {1}" -f $b2.id, $(if ($b2.id) { "PASS" } else { "FAIL" }))
$bid2 = $b2.id

# --- B cancels own ---
Invoke-RestMethod "$base/api/bookings/$bid2" -Method Delete -Headers (AuthHeaders $tokB) -TimeoutSec 30 | Out-Null

# --- admin gates ---
ExpectStatus { Invoke-WebRequest "$base/api/admin/bookings" -Headers (AuthHeaders $tokA) -UseBasicParsing -TimeoutSec 30 } "403" "admin API as USER"
$adminEmail = $env:ADMIN_EMAIL
if (-not $adminEmail) { $adminEmail = "admin@vanprastha.com" }
$adminPassword = $env:ADMIN_PASSWORD
if (-not $adminPassword) {
  throw "ADMIN_PASSWORD environment variable is required for the e2e suite (no hardcoded default credentials - see C1)."
}
$adminLogin = PostJson "/api/auth/login" @{ email = $adminEmail; password = $adminPassword }
$tokAdmin = $adminLogin.token
$adminBookings = Invoke-RestMethod "$base/api/admin/bookings" -Headers (AuthHeaders $tokAdmin) -TimeoutSec 30
Write-Host ("admin bookings: count={0} => {1}" -f $adminBookings.Count, $(if ($adminBookings.Count -ge 0) { "PASS" } else { "FAIL" }))
$adminUsers = Invoke-RestMethod "$base/api/admin/users" -Headers (AuthHeaders $tokAdmin) -TimeoutSec 30
Write-Host ("admin users: count={0} => {1}" -f $adminUsers.Count, $(if ($adminUsers.Count -ge 2) { "PASS" } else { "FAIL" }))
$rev = Invoke-RestMethod "$base/api/admin/revenue" -Headers (AuthHeaders $tokAdmin) -TimeoutSec 30
Write-Host "admin revenue: total=$($rev.totalRevenue) bookings=$($rev.totalBookings) OK"
$pay = Invoke-RestMethod "$base/api/admin/payments" -Headers (AuthHeaders $tokAdmin) -TimeoutSec 30
Write-Host ("admin payments: count={0} OK" -f $pay.Count)

# --- role management: promote B, self-demote guard ---
$patch = Invoke-RestMethod "$base/api/admin/users/$($regB.user.id)" -Method Patch -ContentType $json -Headers (AuthHeaders $tokAdmin) -Body (@{ role = "ADMIN" } | ConvertTo-Json) -TimeoutSec 30
Write-Host ("promote B: role={0} => {1}" -f $patch.role, $(if ($patch.role -eq "ADMIN") { "PASS" } else { "FAIL" }))
# Re-login so B's token carries the fresh ADMIN role, then self-demote must be blocked.
$freshB = PostJson "/api/auth/login" @{ email = $uB; password = "password123" }
$tokB2 = $freshB.token
ExpectStatus { Invoke-WebRequest "$base/api/admin/users/$($regB.user.id)" -Method Patch -ContentType $json -Headers (AuthHeaders $tokB2) -Body (@{ role = "USER" } | ConvertTo-Json) -UseBasicParsing -TimeoutSec 30 } "400" "self-demote guard"
Invoke-RestMethod "$base/api/admin/users/$($regB.user.id)" -Method Patch -ContentType $json -Headers (AuthHeaders $tokAdmin) -Body (@{ role = "USER" } | ConvertTo-Json) -TimeoutSec 30 | Out-Null

# --- invalid token -> 401 ---
ExpectStatus { Invoke-WebRequest "$base/api/bookings" -Headers @{ Authorization = "Bearer forged.token.here" } -UseBasicParsing -TimeoutSec 30 } "401" "forged token"

# --- middleware: /admin without cookie -> redirect ---
$res = Invoke-WebRequest "$base/admin" -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 30 -ErrorAction SilentlyContinue
$loc = $res.Headers.Location
Write-Host ("admin gate redirect: status={0} loc={1}" -f $res.StatusCode, $loc)

Write-Host "=== ALL API CHECKS DONE ==="