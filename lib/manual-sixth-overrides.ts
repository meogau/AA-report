import type { PropertyClass } from "@/lib/property-data";

export const manualSixthOverrides: Record<string, PropertyClass> = {
  "ac-acct-group-condn": {
    name: "AC.ACCT.GROUP.CONDN",
    slug: "ac-acct-group-condn",
    fields: [
      {
        name: "AA.AGC.THRESHOLD",
        slot: 3,
        details: [
          "Ngưỡng áp rule cho từng nhóm transaction code trong classic account condition.",
          "Các dòng threshold là lớp bao ngoài cho `TXN.CODE.GRP`, waive flag và no-violation flag."
        ]
      },
      {
        name: "AA.AGC.TXN.CODE.GRP",
        slot: 4,
        details: [
          "Nhóm transaction code được đưa vào cùng một dòng threshold.",
          "Check sang `TRANSACTION` để chọn đúng nhóm giao dịch bị kiểm soát."
        ]
      },
      {
        name: "AA.AGC.WAIVE.CR.INT",
        slot: 5,
        details: [
          "Cờ miễn credit interest khi threshold này bị chạm.",
          "Field này đi cặp với `NO.VIOLATION` để xác định cách xử lý sau vi phạm."
        ]
      },
      {
        name: "AA.AGC.NO.VIOLATION",
        slot: 6,
        details: [
          "Cờ cho biết chạm threshold có bị coi là vi phạm hay chỉ là mốc theo dõi.",
          "Nếu bật, hệ thống có thể không raise violation dù đã đạt ngưỡng."
        ]
      },
      {
        name: "AA.AGC.RETENTION.PERIOD",
        slot: 7,
        details: [
          "Khoảng thời gian lưu hoặc xét retention cho rule account group.",
          "Field dùng kiểu `PRD` nên mang nghĩa một period nghiệp vụ chứ không phải ngày tuyệt đối."
        ]
      },
      {
        name: "AA.AGC.PREMIUM.TYPE",
        slot: 8,
        details: [
          "Loại savings premium gắn với condition này.",
          "Check sang `SAVINGS.PREMIUM`."
        ]
      },
      {
        name: "AA.AGC.DEFER.CHARGE.DAYS",
        slot: 9,
        details: [
          "Số ngày trì hoãn trước khi charge thực sự được áp.",
          "Field này là khoảng chờ cho các charge gắn với account group condition."
        ]
      },
      {
        name: "AA.AGC.CHARGE.PENDING.CAT",
        slot: 10,
        details: [
          "Category dùng để treo charge pending khi chưa được hạch toán ngay.",
          "Check sang `CATEGORY`."
        ]
      },
      {
        name: "AA.AGC.TAX.PENDING.CAT",
        slot: 11,
        details: [
          "Category treo riêng phần thuế pending.",
          "Tách khỏi pending category của charge gốc."
        ]
      },
      {
        name: "AA.AGC.AUTO.SETTLE",
        slot: 12,
        details: [
          "Cờ cho biết charge/condition này có auto settle hay không.",
          "Source chỉ cho `YES/NO`."
        ]
      },
      {
        name: "AA.AGC.CREDIT.CHECK",
        slot: 13,
        details: [
          "Loại balance được dùng khi kiểm tra credit, như `WORKING`, `FORWARD`, `AVAILABLE`, `AVAILWORK`, `AVAILFWD`.",
          "Field này quyết định balance basis cho rule credit control."
        ]
      },
      {
        name: "AA.AGC.AVAILABLE.BAL.UPD",
        slot: 14,
        details: [
          "Cách cập nhật available balance: cả hai chiều, không cập nhật, chỉ debit hoặc chỉ credit.",
          "Field này là rule điều chỉnh balance-availability khi có giao dịch liên quan."
        ]
      },
      {
        name: "AA.AGC.SETTLE.ACCT.CLOSE",
        slot: 15,
        details: [
          "Cờ cho biết khi đóng tài khoản settle có cần xử lý condition này hay không.",
          "Source chỉ cho `NO` hoặc `Y`."
        ]
      },
      {
        name: "AA.AGC.ALLOW.TXN.CODE",
        slot: 16,
        details: [
          "Danh sách transaction code được phép trong condition này.",
          "Dùng để whitelist giao dịch hợp lệ theo classic mapping."
        ]
      },
      {
        name: "AA.AGC.DEBIT.RESTRICT",
        slot: 17,
        details: [
          "Cờ hạn chế debit trên account group condition.",
          "Đi cùng `RESTRICTED.MSG` để trả thông điệp khi debit bị chặn."
        ]
      },
      {
        name: "AA.AGC.RESTRICTED.MSG",
        slot: 18,
        details: [
          "Thông điệp hiển thị khi rule hạn chế debit được kích hoạt.",
          "Field này là text mô tả lý do bị chặn."
        ]
      },
      {
        name: "AA.AGC.NOTICE.AMOUNT",
        slot: 19,
        details: [
          "Số tiền làm mốc phát notice cho account group condition.",
          "Field được định nghĩa kiểu amount theo local currency."
        ]
      },
      {
        name: "AA.AGC.NOTICE.PERIOD",
        slot: 20,
        details: [
          "Khoảng thời gian áp cho notice liên quan threshold/account group.",
          "Đi kèm `NOTICE.AMOUNT` và `AVAILABILITY`."
        ]
      }
    ],
    actions: [
      {
        name: "NO DIRECT ACTION AC.ACCT.GROUP.CONDN",
        routine: "",
        summary: "Trong `T24.BP` hiện chỉ thấy routine `FIELDS` cho property này; chưa thấy action routine riêng để mô tả select/update file business.",
        steps: [
          "Bước 1: source định nghĩa cấu trúc threshold, transaction-code group, retention, pending category, availability và restriction fields.",
          "Bước 2: chưa thấy file `UPDATE`, `VALIDATE` hay action tài chính riêng cho property class này trong batch source hiện có.",
          "Bước 3: vì không có routine action nguồn nên chưa có bằng chứng để mô tả các bước read/write bảng cụ thể."
        ],
        flow: [
          "Hiện mới xác nhận được phần dictionary/field semantics."
        ]
      }
    ]
  },
  "ac-general-charge": {
    name: "AC.GENERAL.CHARGE",
    slug: "ac-general-charge",
    fields: [
      {
        name: "AA.GC.DEBIT.INT.ADDON",
        slot: 3,
        details: [
          "Mã cấu hình cộng thêm vào debit interest charge.",
          "Check sang `DEBIT.INT.ADDON`."
        ]
      },
      {
        name: "AA.GC.GOVERNMENT.MARGIN",
        slot: 4,
        details: [
          "Mã margin chính phủ dùng cho charge/interest classic mapping.",
          "Check sang `GOVERNMENT.MARGIN`."
        ]
      },
      {
        name: "AA.GC.HIGHEST.DEBIT",
        slot: 5,
        details: [
          "Mã cấu hình highest debit được dùng để tính charge.",
          "Cho biết charge này phụ thuộc peak debit balance."
        ]
      },
      {
        name: "AA.GC.INTEREST.STATEMENT",
        slot: 6,
        details: [
          "Mã interest statement charge/config áp cho account.",
          "Check sang `INTEREST.STATEMENT`."
        ]
      },
      {
        name: "AA.GC.BAL.REQUIREMENT",
        slot: 7,
        details: [
          "Mã cấu hình balance requirement làm điều kiện charge.",
          "Dùng để ràng buộc charge với mức số dư."
        ]
      },
      {
        name: "AA.GC.TRANS.CODE.CHARGE",
        slot: 13,
        details: [
          "Cờ bật charge theo transaction code.",
          "Nếu bật thì `COMB.TRNS.CHRG.CODE`, `TR.CODE.CR`, `TR.CODE.DR` mới có ý nghĩa thực tế."
        ]
      },
      {
        name: "AA.GC.COMB.TRNS.CHRG.CODE",
        slot: 14,
        details: [
          "Transaction charge code kết hợp cho flow charge theo transaction.",
          "Check sang `TRANSACTION.CHARGE`."
        ]
      },
      {
        name: "AA.GC.CATEGORY",
        slot: 15,
        details: [
          "Category kế toán hoặc phân loại áp cho charge.",
          "Field check sang `CATEGORY`."
        ]
      },
      {
        name: "AA.GC.CHARGE.CODE.LEVEL",
        slot: 18,
        details: [
          "Mức áp charge code, source cho `COM` hoặc `IND`.",
          "Xác định charge code dùng ở cấp tổng hợp hay từng giao dịch."
        ]
      },
      {
        name: "AA.GC.WAIVE.CHRG.NEG.BAL",
        slot: 19,
        details: [
          "Cờ miễn charge khi balance âm.",
          "Rule này chặn charge trong các case negative balance đã được cấu hình."
        ]
      },
      {
        name: "AA.GC.PERCT.FOR.OFFSET",
        slot: 20,
        details: [
          "Tỷ lệ phần trăm offset dùng để giảm charge dựa trên số dư bù trừ.",
          "Đi cùng nhóm `OFFSET.*`."
        ]
      },
      {
        name: "AA.GC.OFFSET.BAL.TYPE",
        slot: 21,
        details: [
          "Loại balance dùng khi tính offset, như `AVERAGE` hoặc `MINIMUM`.",
          "Quyết định cách đo balance offset."
        ]
      },
      {
        name: "AA.GC.OFFSET.CURRENCY",
        slot: 22,
        details: [
          "Currency dùng cho khối offset amount.",
          "Các field amount offset bên dưới bám theo currency này."
        ]
      },
      {
        name: "AA.GC.MIN.AV.BAL",
        slot: 23,
        details: [
          "Mức số dư bình quân tối thiểu để được offset charge.",
          "Field amount được neo theo `OFFSET.CURRENCY`."
        ]
      },
      {
        name: "AA.GC.DAY.BASIS",
        slot: 24,
        details: [
          "Day basis dùng để tính charge theo offset balance.",
          "Source cho các option basis `A` đến `F` và check sang `INTEREST.BASIS`."
        ]
      }
    ],
    actions: [
      {
        name: "NO DIRECT ACTION AC.GENERAL.CHARGE",
        routine: "",
        summary: "Trong source hiện chỉ thấy routine field-definition cho classic general charge; chưa thấy action routine riêng.",
        steps: [
          "Bước 1: source định nghĩa các nhóm charge config: debit add-on, highest debit, statement charge, transaction-code charge, offset charge, FCY charge và interest-charge balance rules.",
          "Bước 2: chưa thấy `UPDATE` hay routine action trực tiếp của property class này trong `T24.BP` batch hiện tại.",
          "Bước 3: vì không có action source nên chưa thể kết luận bảng nào được select/update từ property này."
        ],
        flow: [
          "Hiện mới xác nhận được semantics ở tầng field mapping."
        ]
      }
    ]
  },
  "ac-group-cap": {
    name: "AC.GROUP.CAP",
    slug: "ac-group-cap",
    fields: [
      {
        name: "AA.GCP.DR.CAP.FREQUENCY",
        slot: 3,
        details: [
          "Chu kỳ capitalisation của nhóm debit interest chính.",
          "Field dùng kiểu `FQU` nên đây là lịch capitalise lặp lại."
        ]
      },
      {
        name: "AA.GCP.DR2.CAP.FREQUENCY",
        slot: 4,
        details: [
          "Chu kỳ capitalisation của nhóm debit interest thứ hai.",
          "Tách riêng với dòng debit chính để map classic group thứ cấp."
        ]
      },
      {
        name: "AA.GCP.CR.CAP.FREQUENCY",
        slot: 5,
        details: [
          "Chu kỳ capitalisation của credit interest chính.",
          "Là lịch gom/capitalise cho nhánh credit."
        ]
      },
      {
        name: "AA.GCP.CR2.CAP.FREQUENCY",
        slot: 6,
        details: [
          "Chu kỳ capitalisation của credit interest nhóm thứ hai.",
          "Dùng cho classic mapping nhiều nhóm credit."
        ]
      },
      {
        name: "AA.GCP.SETTLE.ACCT.CLOSE",
        slot: 7,
        details: [
          "Cờ cho biết khi đóng settle account có xử lý capitalisation group này hay không.",
          "Source chỉ cho `NO` hoặc `Y`."
        ]
      },
      {
        name: "AA.GCP.START.OF.DAY.CAP",
        slot: 8,
        details: [
          "Cờ capitalise vào đầu ngày thay vì cuối chu kỳ.",
          "Field này điều khiển thời điểm hạch toán capitalisation trong ngày."
        ]
      }
    ],
    actions: [
      {
        name: "NO DIRECT ACTION AC.GROUP.CAP",
        routine: "",
        summary: "Source hiện chỉ có dictionary của nhóm capitalisation classic, chưa có action routine riêng trong `T24.BP` batch này.",
        steps: [
          "Bước 1: field-definition cho thấy property này chỉ mang cấu hình tần suất capitalise cho debit/credit groups.",
          "Bước 2: chưa thấy file update hoặc processing riêng để chứng minh luồng read/write dữ liệu business."
        ],
        flow: [
          "Hiện mới khóa được ý nghĩa field."
        ]
      }
    ]
  },
  "ac-group-interest": {
    name: "AC.GROUP.INTEREST",
    slug: "ac-group-interest",
    fields: [
      {
        name: "AA.GI.CR.MIN.VALUE",
        slot: 3,
        details: [
          "Số tiền credit interest tối thiểu trước khi được post hoặc giữ lại.",
          "Là ngưỡng tối thiểu cho nhánh credit interest chính."
        ]
      },
      {
        name: "AA.GI.CR.MIN.WAIVE",
        slot: 4,
        details: [
          "Cờ miễn post credit interest nếu dưới mức tối thiểu.",
          "Đi cùng `CR.MIN.VALUE`."
        ]
      },
      {
        name: "AA.GI.CR.OFFSET.ONLY",
        slot: 5,
        details: [
          "Cờ cho biết credit interest chỉ áp khi có offset balance.",
          "Nếu bật, nhánh credit này không chạy như interest thông thường."
        ]
      },
      {
        name: "AA.GI.CR.ZERO.INT.BAL",
        slot: 6,
        details: [
          "Mức balance mà từ đó credit interest về 0.",
          "Field này xác định ngưỡng ngừng trả lãi."
        ]
      },
      {
        name: "AA.GI.CR.ACCR.OPEN.AC",
        slot: 8,
        details: [
          "Cờ accrue credit interest ngay khi account mở.",
          "Điều khiển điểm bắt đầu accrue của credit leg."
        ]
      },
      {
        name: "AA.GI.CR.ACCR.CLOSE.AC",
        slot: 9,
        details: [
          "Cờ accrue credit interest tại thời điểm đóng account.",
          "Cho biết close-account có kéo accrual cuối hay không."
        ]
      },
      {
        name: "AA.GI.MAX.LEGAL.RATE",
        slot: 19,
        details: [
          "Mức trần lãi suất pháp lý tối đa.",
          "Dùng để giới hạn rate cuối cùng của classic interest mapping."
        ]
      },
      {
        name: "AA.GI.MAX.DEBIT.CHG.RATE",
        slot: 20,
        details: [
          "Mức trần rate cho debit charge/interest.",
          "Giới hạn riêng cho nhánh debit charging."
        ]
      },
      {
        name: "AA.GI.APR.REQUIRED",
        slot: 21,
        details: [
          "Cờ cho biết product này có bắt buộc APR hay không.",
          "Nếu bật, classic interest mapping phải hỗ trợ APR output."
        ]
      },
      {
        name: "AA.GI.BAL.CALC.ROUTINE",
        slot: 22,
        details: [
          "Routine tính balance dùng làm cơ sở interest.",
          "Field này cho phép classic mapping trỏ sang routine tính balance riêng."
        ]
      },
      {
        name: "AA.GI.DEFER.DB.INT.DAYS",
        slot: 23,
        details: [
          "Số ngày trì hoãn trước khi debit interest được xử lý.",
          "Đi cùng `DB.INT.PENDING.CAT` để treo pending."
        ]
      },
      {
        name: "AA.GI.DB.INT.PENDING.CAT",
        slot: 24,
        details: [
          "Category treo debit interest pending.",
          "Check sang `CATEGORY`."
        ]
      },
      {
        name: "AA.GI.INT.POST.PERIOD",
        slot: 26,
        details: [
          "Chu kỳ post interest, source cho `M`, `Q`, `S`, `A`.",
          "Điều khiển kỳ hạch toán lãi."
        ]
      },
      {
        name: "AA.GI.RATE.CHANGE.ADVICE",
        slot: 27,
        details: [
          "Cờ gửi advice khi rate change.",
          "Nếu bật thì `ADVICE.TYPE` trở nên có ý nghĩa."
        ]
      },
      {
        name: "AA.GI.ADVICE.TYPE",
        slot: 28,
        details: [
          "Mẫu advice dùng cho thông báo thay đổi lãi suất.",
          "Check sang `EB.ADVICES`."
        ]
      }
    ],
    actions: [
      {
        name: "NO DIRECT ACTION AC.GROUP.INTEREST",
        routine: "",
        summary: "Source batch hiện có chỉ chứa field-definition cho classic group interest, chưa có action routine riêng.",
        steps: [
          "Bước 1: field-definition cho thấy property này cấu hình ngưỡng, waive, offset, APR, rounding, tax key và posting period của các nhóm lãi classic.",
          "Bước 2: chưa thấy file update/processing action riêng trong `T24.BP` hiện tại."
        ],
        flow: [
          "Mới khóa được semantics field, chưa có bằng chứng source để mô tả read/write file."
        ]
      }
    ]
  },
  "account-consent": {
    name: "ACCOUNT.CONSENT",
    slug: "account-consent",
    fields: [
      {
        name: "AA.PSD2.EB.EXTERNAL.USER.ID",
        slot: 3,
        details: [
          "Mã người dùng ngoài hệ thống gắn với consent.",
          "Field này nhận chuỗi tự do và dùng để giữ liên kết external user."
        ]
      },
      {
        name: "AA.PSD2.SIGNUP.SERVICE",
        slot: 4,
        details: [
          "Loại dịch vụ consent được đăng ký: `AISP`, `PISP`, `CBPIISP`.",
          "Validate/default logic đọc field này để xử lý signup-service phù hợp."
        ]
      },
      {
        name: "AA.PSD2.TPP.REFERENCE",
        slot: 5,
        details: [
          "Mã TPP dùng để tra alternate-id trong open banking directory.",
          "Field bị đánh dấu `NOCHANGE` và là khóa chính khi update TPP XREF."
        ]
      },
      {
        name: "AA.PSD2.TPP.NAME",
        slot: 6,
        details: [
          "Tên TPP tương ứng với reference đã nhập.",
          "Validate có thể default field này từ open banking directory nếu còn trống."
        ]
      },
      {
        name: "AA.PSD2.ACCESS.FREQUENCY",
        slot: 7,
        details: [
          "Tần suất mà TPP được phép truy cập account data.",
          "Là thông tin hạn mức truy cập ở cấp consent."
        ]
      },
      {
        name: "AA.PSD2.DEF.CONSENT.TYPE",
        slot: 8,
        details: [
          "Nhóm consent type mặc định ở mức tổng thể.",
          "Check sang `PZ.CONSENT.TYPE.DEFINITION`."
        ]
      },
      {
        name: "AA.PSD2.EXT.REF.ID",
        slot: 9,
        details: [
          "External reference id của consent.",
          "Action update dùng field này để quyết định có phải đổi consent id hay không."
        ]
      },
      {
        name: "AA.PSD2.RECURRING.INDICATOR",
        slot: 10,
        details: [
          "Cờ cho biết consent là recurring hay one-off.",
          "Tham gia điều kiện đổi `CONSENT.ID` khi condition bị sửa."
        ]
      },
      {
        name: "AA.PSD2.CONSENT.ID",
        slot: 11,
        details: [
          "Mã consent thực tế, source đánh dấu `NOINPUT`.",
          "Auth update set field này bằng `ARR.ACTIVITY.ID` cho consent mới hoặc khi thông tin cốt lõi bị thay đổi."
        ]
      },
      {
        name: "AA.PSD2.ONLINE.ARRANGEMENT",
        slot: 12,
        details: [
          "Mã online arrangement liên quan tới consent.",
          "Giữ liên kết giữa consent property và hành trình online."
        ]
      },
      {
        name: "AA.PSD2.ACCOUNT.ID",
        slot: 21,
        details: [
          "Danh sách account nằm trong consent.",
          "Validate đọc từng account, kiểm tra account live/hist và block default."
        ]
      },
      {
        name: "AA.PSD2.ACC.CONSENT.TYPE",
        slot: 22,
        details: [
          "Consent type áp riêng cho từng account.",
          "Check sang `PZ.CONSENT.TYPE.DEFINITION` và được expand granular/global ở input action."
        ]
      },
      {
        name: "AA.PSD2.ACC.BLOCK",
        slot: 23,
        details: [
          "Cờ block account trong consent.",
          "Nếu bật thì `ACC.BLOCK.NOTES` bắt buộc và `ACC.BLOCK.FROM` có thể được default."
        ]
      },
      {
        name: "AA.PSD2.ACC.BLOCK.FROM",
        slot: 24,
        details: [
          "Ngày bắt đầu block account.",
          "Validate mặc định ngày này bằng hôm nay nếu block = YES mà field trống."
        ]
      },
      {
        name: "AA.PSD2.ACC.BLOCK.TILL",
        slot: 25,
        details: [
          "Ngày hết block account.",
          "Đi cùng khoảng block của từng account line."
        ]
      },
      {
        name: "AA.PSD2.ACC.BLOCK.NOTES",
        slot: 26,
        details: [
          "Lý do hoặc ghi chú của block account.",
          "Validate bắt buộc field này khi `ACC.BLOCK = YES`."
        ]
      },
      {
        name: "AA.PSD2.EXPIRY.PERIOD",
        slot: 32,
        details: [
          "Khoảng thời gian hết hạn consent ở dạng period.",
          "Validate designer kiểm tra ký tự đầu phải là `Y/M/W/D` và phần sau phải là số."
        ]
      },
      {
        name: "AA.PSD2.EXPIRY.DATE",
        slot: 33,
        details: [
          "Ngày hết hạn consent.",
          "Nếu chưa nhập mà có `EXPIRY.PERIOD`, validate sẽ tự tính ngày này từ hôm nay."
        ]
      },
      {
        name: "AA.PSD2.CONSENT.STATUS",
        slot: 37,
        details: [
          "Danh sách status của consent theo timeline.",
          "Auth/update/expire/closure đều chèn thêm status mới vào đầu danh sách này."
        ]
      },
      {
        name: "AA.PSD2.LAST.ACTION.DATE",
        slot: 38,
        details: [
          "Ngày phát sinh từng status trong `CONSENT.STATUS`.",
          "Luôn được cập nhật song song với status."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE ACCOUNT.CONSENT",
        routine: "AA.ACCOUNT.CONSENT.UPDATE.b",
        summary: "Auth path cập nhật TPP XREF, set consent id/status, schedule expiry và closure activity; input path expand granular consent types.",
        steps: [
          "Bước 1: routine đọc full AAA status, arrangement/activity/property context, expiry date mới và consent status từ `R.NEW`.",
          "Bước 2: ở `UNAUTH` hoặc `UNAUTH-CHG`, routine lấy `ACC.CONSENT.TYPE`, loop từng account line rồi gọi `PZ.Consent.PzGetGranularConsent(...)` để lấy cả global và granular consents cho account-consent-type đã nhập.",
          "Bước 3: ở `AUTH`, routine chọn `UpdateType = ADD`, rồi trong `UPDATE.CONSENT.XREF` lấy customer chính hoặc beneficial owner, lấy `TPP.REFERENCE`, xác định company theo `PZ.PARAMETER`, form `xRefId = CustomerId*TPP*Company`, rồi gọi `PZ.Consent.UpdatePsd2Xref(xRefId, oldXrefId, ArrActivityId, UpdateType, ...)`.",
          "Bước 4: `UPDATE.STATUS` chèn status `valid` vào `CONSENT.STATUS` và chèn ngày hôm nay vào `LAST.ACTION.DATE` nếu status đó chưa tồn tại.",
          "Bước 5: `UPDATE.CONSENT.ID` đọc previous property bằng `AA.Framework.GetPreviousPropertyRecord(...)`; nếu là consent mới thì set `CONSENT.ID = ARR.ACTIVITY.ID`, còn nếu các field cốt lõi như expiry, consent type, signup service, ext ref, recurring indicator, account/block fields bị thay đổi thì cũng reset `CONSENT.ID` về AAA id hiện tại.",
          "Bước 6: `SCHEDULE.EXPIRY.ACTIVITY` so sánh expiry cũ/mới rồi gọi `AA.Framework.SetScheduledActivity(...)` theo mode `AMEND` hoặc `DELETE` cho activity `ACC.CONSENT-EXPIRE-<PropertyId>`.",
          "Bước 7: `SCHEDULE.CLOSURE.ACTIVITY` kiểm tra duplicate/status `revokedByPsu` hoặc `terminatedByTpp`; nếu cần thì schedule `ACC.CONSENT-CLOSE-ARRANGEMENT` tại ngày hôm nay.",
          "Bước 8: nếu duplicate xref được phát hiện, routine còn gọi `updateConsentStatus`, đọc consent cũ bằng `PZ.ModelBank.PzReadConsent(...)`, chèn thêm status `terminatedByTpp`, rồi `EB.DataAccess.FWrite(\"F.AA.ARR.ACCOUNT.CONSENT\", consentKey, ConsentRec)` để ghi thẳng record consent cũ."
        ],
        flow: [
          "Cập nhật TPP XREF qua `PZ.Consent.UpdatePsd2Xref(...)`.",
          "Cập nhật `R.NEW` các field status/consent id.",
          "Cập nhật `AA.SCHEDULED.ACTIVITY` cho expiry/closure.",
          "Trong nhánh duplicate, ghi trực tiếp `F.AA.ARR.ACCOUNT.CONSENT`."
        ]
      },
      {
        name: "EXPIRE ACCOUNT.CONSENT",
        routine: "AA.ACCOUNT.CONSENT.EXPIRE.b",
        summary: "Auth path chuyển status consent sang `expired` khi đến ngày hết hạn và cập nhật lại TPP XREF.",
        steps: [
          "Bước 1: routine đọc `CONSENT.STATUS`, `LAST.ACTION.DATE`, `EXPIRY.DATE`, `TODAY`, `NEXT.WORKING.DAY` và effective date.",
          "Bước 2: nếu AAA status là `AUTH` hoặc `AUTH-REV`, routine vào nhánh authorise.",
          "Bước 3: nếu `EXPIRY.DATE` tồn tại, lớn hơn hoặc bằng hôm nay và nhỏ hơn ngày làm việc kế tiếp, routine chèn status `expired` vào đầu `CONSENT.STATUS` và chèn `today` vào `LAST.ACTION.DATE`.",
          "Bước 4: sau đó `UpdatePsd2TppXref` lấy customer chính hoặc beneficial owner, lấy `TPP.REFERENCE`, xác định company, form xref id rồi gọi `PZ.Consent.UpdatePsd2Xref(..., \"ADD\", ...)`."
        ],
        flow: [
          "Cập nhật `R.NEW` status consent.",
          "Cập nhật TPP XREF qua `PZ.Consent.UpdatePsd2Xref(...)`."
        ]
      },
      {
        name: "CLOSE ACCOUNT.CONSENT",
        routine: "AA.ACCOUNT.CONSENT.CLOSE.b",
        summary: "Khi consent bị đóng, auth path cập nhật TPP XREF cho consent đã close nếu activity nằm trong kỳ xử lý cho phép.",
        steps: [
          "Bước 1: routine đọc `ACTIVITY.STATUS`, `EFFECTIVE.DATE`, `ARRANGEMENT.ID`, `PeriodEndDate`.",
          "Bước 2: chỉ khi `EFFECTIVE.DATE` không vượt quá period end hiện tại thì mới xử lý action.",
          "Bước 3: ở `AUTH` hoặc `AUTH-REV`, routine đặt `UpdateType = ADD` rồi gọi `UPDATE.CONSENT.XREF`.",
          "Bước 4: `UPDATE.CONSENT.XREF` lấy customer chính hoặc beneficial owner, lấy `TPP.REFERENCE`, xác định company từ `PZ.PARAMETER`, form `xRefId`, rồi gọi `PZ.Consent.UpdatePsd2Xref(xRefId, '', ArrActivityId, UpdateType, ...)`."
        ],
        flow: [
          "Không tự update consent record ở file này.",
          "Chỉ cập nhật XREF khi activity close được auth."
        ]
      }
    ]
  },
  "activity-api": {
    name: "ACTIVITY.API",
    slug: "activity-api",
    fields: [
      {
        name: "AA.API.ACTIVITY.CLASS",
        slot: 3,
        details: [
          "Activity class mà bộ API này được gắn vào.",
          "Có thể dùng activity class hoặc activity id, nhưng validate không cho nhập cả hai cùng lúc."
        ]
      },
      {
        name: "AA.API.ACTIVITY.ID",
        slot: 4,
        details: [
          "Activity cụ thể mà bộ API áp dụng.",
          "Check sang `AA.ACTIVITY`."
        ]
      },
      {
        name: "AA.API.PROPERTY.CLASS",
        slot: 5,
        details: [
          "Property class đích của action/API.",
          "Có thể nhập property class hoặc property cụ thể, nhưng không được nhập cả hai."
        ]
      },
      {
        name: "AA.API.PROPERTY",
        slot: 6,
        details: [
          "Property cụ thể nhận action/API.",
          "Nếu chỉ nhập property thì validate sẽ tự suy ra property class khi check action."
        ]
      },
      {
        name: "AA.API.PC.ACTION",
        slot: 7,
        details: [
          "Action của property class sẽ được gắn các routine API.",
          "Validate gọi `AA.Framework.ValidateAction(...)` để chắc action hợp lệ cho property class."
        ]
      },
      {
        name: "AA.API.PRE.ROUTINE",
        slot: 8,
        details: [
          "Routine chạy trước khi action xử lý.",
          "Check sang `EB.API`."
        ]
      },
      {
        name: "AA.API.POST.ROUTINE",
        slot: 9,
        details: [
          "Routine chạy sau khi action xử lý.",
          "Source đánh dấu là hook khác loại `HOOKOTHER`."
        ]
      },
      {
        name: "AA.API.RECORD.RTN",
        slot: 10,
        details: [
          "Record routine gắn cho action/activity.",
          "Dùng khi cần sửa `R.NEW` hoặc table definition ở tầng record."
        ]
      },
      {
        name: "AA.API.VALIDATE.RTN",
        slot: 11,
        details: [
          "Routine validate chính cho mapping này.",
          "Cho phép gắn hook validate riêng theo activity/property."
        ]
      },
      {
        name: "AA.API.PRE.VALIDATE.RTN",
        slot: 12,
        details: [
          "Routine chạy trước validate chính.",
          "Source gắn field này cho hook `HOOK.AA.ACTIVITY.API.PRE.VAL.RTN`."
        ]
      }
    ],
    actions: [
      {
        name: "NO DIRECT ACTION ACTIVITY.API",
        routine: "AA.ACTIVITY.API.VALIDATE.b",
        summary: "Property này không có action runtime riêng; logic nguồn chủ yếu nằm ở validate để kiểm tra mapping activity/property/action/routine.",
        steps: [
          "Bước 1: validate kiểm tra bắt buộc phải có một trong `ACTIVITY.CLASS/ACTIVITY.ID` và một trong `PROPERTY.CLASS/PROPERTY`.",
          "Bước 2: xác định số vòng lặp theo số multivalue lớn nhất của activity class, activity id, property class hoặc property.",
          "Bước 3: với từng dòng, routine build chuỗi kiểm tra trùng `ACTIVITY.CLASS*ACTIVITY.ID*PROPERTY.CLASS*PROPERTY*PC.ACTION` vào `AA.ACTIVITY.API.LIST`.",
          "Bước 4: `CHECK.MUTUALLY.EXCLUSIVE.CONDS` raise error nếu nhập đồng thời activity class và activity id, hoặc property class và property.",
          "Bước 5: `CALL.VALIDATE.ACTION` lấy property class/property/action, có thể tự suy ra property class từ property, rồi gọi `AA.Framework.ValidateAction(PROPERTY.CLASS, ACTIONS, RET.ERROR)` để kiểm tra action có hợp lệ không.",
          "Bước 6: cuối cùng routine kiểm tra duplicate conditions trong `AA.ACTIVITY.API.LIST` và kiểm tra bộ API routines để tránh cấu hình trùng/lỗi."
        ],
        flow: [
          "Không update bảng business runtime.",
          "Vai trò chính là validate cấu hình hook API cho activity/property."
        ]
      }
    ]
  },
  "activity-mapping": {
    name: "ACTIVITY.MAPPING",
    slug: "activity-mapping",
    fields: [
      {
        name: "AA.ACM.TRANSACTION",
        slot: 3,
        details: [
          "Transaction code sẽ được map sang activity/service-group trong AA.",
          "Validate yêu cầu transaction codes phải unique."
        ]
      },
      {
        name: "AA.ACM.TXN.SERVICE.GROUP",
        slot: 6,
        details: [
          "Service group gắn với transaction code.",
          "Lookup từ `AA.SERVICE`."
        ]
      },
      {
        name: "AA.ACM.TXN.ACTIVITY",
        slot: 7,
        details: [
          "Activity tài chính được map trực tiếp từ transaction code.",
          "Validate kiểm tra activity này có được phép dùng cho `ACTIVITY.MAPPING` hay không."
        ]
      },
      {
        name: "AA.ACM.DEF.CR.ACTIVITY",
        slot: 8,
        details: [
          "Activity mặc định cho giao dịch credit khi không map cụ thể.",
          "Đi cùng `DEF.CR.SERVICE.GROUP`."
        ]
      },
      {
        name: "AA.ACM.DEF.DB.ACTIVITY",
        slot: 9,
        details: [
          "Activity mặc định cho giao dịch debit khi không map cụ thể.",
          "Đi cùng `DEF.DB.SERVICE.GROUP`."
        ]
      },
      {
        name: "AA.ACM.EVENT.REF",
        slot: 13,
        details: [
          "Mã event reference từ `TEC.ITEMS` cần map sang activity.",
          "Field này mở nhánh mapping phi tài chính theo event log."
        ]
      },
      {
        name: "AA.ACM.EVENT.ACTIVITY",
        slot: 14,
        details: [
          "Activity tương ứng với event reference.",
          "Cho phép map event ngoại vi thành activity AA."
        ]
      },
      {
        name: "AA.ACM.EVENT.SERVICE.GROUP",
        slot: 15,
        details: [
          "Service group của event mapping.",
          "Song song với `EVENT.ACTIVITY`."
        ]
      },
      {
        name: "AA.ACM.DEF.EVENT.ACTIVITY",
        slot: 16,
        details: [
          "Activity mặc định cho event nếu không có dòng map cụ thể.",
          "Đóng vai trò fallback của event mapping."
        ]
      },
      {
        name: "AA.ACM.DEF.EVENT.SERVICE.GROUP",
        slot: 17,
        details: [
          "Service group mặc định của event mapping.",
          "Là fallback của service-group cho event."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE ACTIVITY.MAPPING",
        routine: "AA.ACTIVITY.MAPPING.UPDATE.b",
        summary: "Action update hiện chỉ track next change condition; logic sâu của property nằm ở validate mapping transaction/event với activity hợp lệ.",
        steps: [
          "Bước 1: routine đọc AAA status, activity id, effective date, arrangement id và property id.",
          "Bước 2: ở `UNAUTH`, `DELETE`, `REVERSE`, routine chỉ gọi `AA.Framework.UpdateChangeCondition()`.",
          "Bước 3: nhánh `AUTH` hiện không có đoạn ghi file business.",
          "Bước 4: validate của property mới là phần quan trọng: `VALIDATE.FINANCIAL.MAPPING` loop các `TXN.ACTIVITY`, gọi `AA.Framework.ValidateAllowedActivity(ACTIVITY.ID, \"ACTIVITY.MAPPING\", ...)` để chắc activity được phép cho property class này, rồi `EB.Template.Dup()` để chặn transaction trùng.",
          "Bước 5: ở arrangement level, validate còn yêu cầu `DEF.EVENT.ACTIVITY` là bắt buộc nếu product có facility property."
        ],
        flow: [
          "Action runtime chỉ track change condition.",
          "Cross-validation kiểm tra tính hợp lệ của mapping transaction/event sang activity."
        ]
      }
    ]
  },
  "activity-messaging": {
    name: "ACTIVITY.MESSAGING",
    slug: "activity-messaging",
    fields: [
      {
        name: "AA.AM.ADVICE",
        slot: 3,
        details: [
          "Mẫu advice sẽ được phát cho activity tương ứng.",
          "Nếu công ty không cài `DE`, record routine sẽ làm field này `NOINPUT`."
        ]
      },
      {
        name: "AA.AM.ACTIVITY.CLASS",
        slot: 4,
        details: [
          "Activity class nhận messaging setup này.",
          "Field này là bắt buộc nếu chưa chỉ rõ activity id."
        ]
      },
      {
        name: "AA.AM.ACTIVITY.ID",
        slot: 5,
        details: [
          "Activity cụ thể nhận messaging setup.",
          "Validate kiểm tra activity này có đúng activity class đã nhập hay không."
        ]
      },
      {
        name: "AA.AM.MSG.CONTENT",
        slot: 6,
        details: [
          "Cách chọn nội dung handoff: `CHANGE` hoặc `ALL`.",
          "Field này quyết định gửi toàn bộ property records hay chỉ phần thay đổi."
        ]
      },
      {
        name: "AA.AM.SEND.ADVICE",
        slot: 7,
        details: [
          "Cờ có gửi advice hay không.",
          "Validate mặc định field này thành `YES` nếu để trống."
        ]
      },
      {
        name: "AA.AM.PRE.NOTICE.ACTIVITY",
        slot: 8,
        details: [
          "Activity pre-notice sẽ được schedule trước activity chính.",
          "Validate yêu cầu activity này thuộc loại scheduled/pre-notice hợp lệ."
        ]
      },
      {
        name: "AA.AM.PRE.NOTICE.DAYS",
        slot: 9,
        details: [
          "Khoảng thời gian lùi lại để phát pre-notice.",
          "Update action dùng field này để tính ngày schedule pre-notice."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE ACTIVITY.MESSAGING",
        routine: "AA.ACTIVITY.MESSAGING.UPDATE.b",
        summary: "Input path tìm scheduled activity tương ứng rồi schedule hoặc reschedule pre-notice activity; các nhánh khác chủ yếu track change condition.",
        steps: [
          "Bước 1: routine đọc AAA status, full status, current activity, arrangement id và property id.",
          "Bước 2: nếu là arrangement mới hoặc current activity là `UPDATE`, routine loop từng `PRE.NOTICE.ACTIVITY` trong `R.NEW`.",
          "Bước 3: với mỗi dòng, gọi `AA.Framework.GetScheduledActivityDate(ARRANGEMENT.ID, PRE.NOTICE.ACTIVITY, \"NEXT\", BASE.DATE, ACTIVITY.EFF.DATE, RET.ERR)` để lấy ngày scheduled của activity gốc.",
          "Bước 4: nếu có `BASE.DATE`, routine đọc property `ACCOUNT`, lấy `BUS.DAY.CENTRES`, tính ngày pre-notice từ `PRE.NOTICE.DAYS`, validate ngày này, rồi gọi label update scheduled activity với `PROCESS.MODE = \"AMEND\"` để ghi pre-notice vào `AA.SCHEDULED.ACTIVITY`.",
          "Bước 5: sau đó routine gọi `AA.Framework.UpdateChangeCondition()`."
        ],
        flow: [
          "Đọc `AA.SCHEDULED.ACTIVITY` qua API get-date.",
          "Cập nhật `AA.SCHEDULED.ACTIVITY` cho pre-notice activity."
        ]
      },
      {
        name: "SEND.MESSAGE ACTIVITY.MESSAGING",
        routine: "AA.ACTIVITY.MESSAGING.SEND.MESSAGE.b",
        summary: "Action cuối activity để build delivery handoff record gồm arrangement, AAA, account details, customer, account và property records rồi phát advice tương ứng.",
        steps: [
          "Bước 1: routine tìm dòng `ACTIVITY.MESSAGING` khớp với activity hiện tại, customer role và cờ `SEND.ADVICE`.",
          "Bước 2: sau khi xác định advice hợp lệ, routine build handoff record nhiều phần: `AA.ARRANGEMENT`, `AA.ARRANGEMENT.ACTIVITY`, `AA.ACCOUNT.DETAILS`, header `DE.O.HEADER`, customer details, account details, danh sách property names và các property records liên quan.",
          "Bước 3: nếu property class không được setup cho delivery thì routine không nhét property record đó vào handoff.",
          "Bước 4: khi `MSG.CONTENT = ALL`, routine truyền toàn bộ `R.NEW`; khi `CHANGE`, routine truyền `R.NEW` và `R.OLD` chỉ cho các property bị sửa.",
          "Bước 5: cuối flow routine handoff sang delivery/outward framework để sinh message/advice tương ứng."
        ],
        flow: [
          "Đọc `AA.ARRANGEMENT`, `AA.ARRANGEMENT.ACTIVITY`, `AA.ACCOUNT.DETAILS`, customer/account/property records.",
          "Handoff sang delivery framework thay vì tự ghi bảng business."
        ]
      },
      {
        name: "SEND.MESSAGE.GUARD ACTIVITY.MESSAGING",
        routine: "AA.ACTIVITY.MESSAGING.SEND.MESSAGE.GUARD.b",
        summary: "Routine guard dùng để quyết định có cho phép chạy send-message action trong ngữ cảnh hiện tại hay không.",
        steps: [
          "Bước 1: guard đứng trước send-message để chặn các case không nên phát advice.",
          "Bước 2: nó làm lớp lọc bảo vệ cho action send-message thay vì sửa dữ liệu condition."
        ],
        flow: [
          "Vai trò guard, không phải action update business."
        ]
      }
    ]
  }
};
