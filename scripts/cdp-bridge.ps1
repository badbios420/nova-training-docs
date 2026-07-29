
$ErrorActionPreference = "Stop"
$listenPort = 9223
$targetHost = "127.0.0.1"
$targetPort = 9222
$endpoint = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Any, $listenPort)
$listener = New-Object System.Net.Sockets.TcpListener $endpoint
$listener.Start()
Write-Output "BRIDGE_UP listen=0.0.0.0:$listenPort -> ${targetHost}:$targetPort"
while ($true) {
  $client = $listener.AcceptTcpClient()
  Start-ThreadJob -ScriptBlock {
    param($client, $targetHost, $targetPort)
    try {
      $remote = New-Object System.Net.Sockets.TcpClient($targetHost, $targetPort)
      $cStream = $client.GetStream()
      $rStream = $remote.GetStream()
      $buf1 = New-Object byte[] 8192
      $buf2 = New-Object byte[] 8192
      while ($client.Connected -and $remote.Connected) {
        $moved = $false
        if ($cStream.DataAvailable) {
          $n = $cStream.Read($buf1, 0, $buf1.Length)
          if ($n -le 0) { break }
          $rStream.Write($buf1, 0, $n)
          $moved = $true
        }
        if ($rStream.DataAvailable) {
          $n = $rStream.Read($buf2, 0, $buf2.Length)
          if ($n -le 0) { break }
          $cStream.Write($buf2, 0, $n)
          $moved = $true
        }
        if (-not $moved) { Start-Sleep -Milliseconds 5 }
      }
    } catch {}
    finally {
      try { $client.Close() } catch {}
      try { $remote.Close() } catch {}
    }
  } -ArgumentList $client, $targetHost, $targetPort | Out-Null
}
