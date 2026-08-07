# CLAUDE.md

이 저장소에서 작업할 때 참고할 운영 메모.

## 샌드박스 네트워크 제약

이 환경(Claude Code 원격 실행 샌드박스)은 외부 CDN 대부분이 프록시에서 403으로 차단된다.

확인된 차단:
- `basemaps.cartocdn.com` (지도 타일)
- `picsum.photos` (mock 이미지)

향후 영향이 예상되는 대상: BunnyCDN 이미지, 카카오 SDK, 외부 폰트 CDN 등 이 저장소 밖의 호스트 전반.

**→ 이런 리소스가 안 뜨는 건 코드 버그가 아닐 수 있다.**
Playwright 등으로 확인한 네트워크 에러가 `ERR_TUNNEL_CONNECTION_FAILED`이면 차단을 먼저 의심하고, 조사에 시간을 쓰지 말고 "환경 제약, 로컬/Preview 확인 필요"로 보고할 것. 차단 우회는 시도하지 않는다.
