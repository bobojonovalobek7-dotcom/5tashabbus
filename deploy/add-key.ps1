# Deploy kalitini serverga qo'shadi (bir marta ishlatiladi).
# Server paroli so'raladi: uni faqat shu oynaga yozasiz.
$server = "root@201.79.42.51"
$pub = Get-Content "$env:USERPROFILE\.ssh\urdu5t_deploy.pub"

Write-Host ""
Write-Host "Server paroli so'raladi. Root parolini yozing va Enter bosing." -ForegroundColor Yellow
Write-Host "(Parol yozilayotganda ekranda ko'rinmaydi - bu normal holat.)" -ForegroundColor Yellow
Write-Host ""

$pub | ssh -o StrictHostKeyChecking=accept-new $server "mkdir -p ~/.ssh && chmod 700 ~/.ssh && grep -qxF '$pub' ~/.ssh/authorized_keys 2>/dev/null || echo '$pub' >> ~/.ssh/authorized_keys; chmod 600 ~/.ssh/authorized_keys && echo OK"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Tayyor! Kalit serverga qo'shildi. Endi Claude'ga 'qo'shdim' deb yozing." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Kalit qo'shilmadi. Parol to'g'riligini tekshirib, qayta urinib ko'ring." -ForegroundColor Red
}
