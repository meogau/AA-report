import type { PropertyClass } from "@/lib/property-data";

export const manualFourthOverrides: Record<string, PropertyClass> = {
  "bundle-hierarchy": {
    name: "BUNDLE.HIERARCHY",
    slug: "bundle-hierarchy",
    fields: [
      {
        name: "AA.BH.ALLOWED.PRODUCT.GROUP",
        slot: 3,
        details: [
          "Nhóm product được phép tham gia trong cấu trúc bundle/pool.",
          "Field này là lớp lọc đầu tiên trước `ALLOWED.PRODUCT` và `ALLOWED.PARENT` khi validate bundle hierarchy."
        ]
      },
      {
        name: "AA.BH.ALLOWED.PRODUCT",
        slot: 4,
        details: [
          "Product con được phép tham gia pool dưới product group đã chọn.",
          "Dùng để giới hạn loại arrangement con được phép link vào bundle."
        ]
      },
      {
        name: "AA.BH.ALLOWED.PARENT",
        slot: 5,
        details: [
          "Product của parent/master arrangement được phép nhận account con.",
          "Field này kiểm soát nhánh parent hợp lệ cho link bundle hierarchy."
        ]
      },
      {
        name: "AA.BH.ACCOUNT.REF",
        slot: 6,
        details: [
          "Danh sách account draft/CT account sẽ được đưa vào pool orchestration.",
          "Trong `AA.BUNDLE.HIERARCHY.UPDATE.b` và `HANDOFF.DETAILS.b`, field này là khóa chính để tìm live date, build sequence và ghi `PodAccountRef`."
        ]
      },
      {
        name: "AA.BH.ACCOUNT.ALIAS",
        slot: 7,
        details: [
          "Alias đi kèm account ref trong orchestration.",
          "Field được chép sang `PodAccountAlias` của `AA.POOL.ORCHESTRATION.DETAILS`."
        ]
      },
      {
        name: "AA.BH.CUSTOMER",
        slot: 9,
        details: [
          "Customer sở hữu hoặc gắn với từng account draft trong pool.",
          "Source `HANDOFF.DETAILS` chép trực tiếp field này sang `PodCustomer`."
        ]
      },
      {
        name: "AA.BH.ACC.COMPANY",
        slot: 10,
        details: [
          "Company chứa account draft hoặc CT account.",
          "Source update dùng field này để load đúng company khác khi đọc live date hoặc kiểm tra account ở cross-pool."
        ]
      },
      {
        name: "AA.BH.ACC.CURRENCY",
        slot: 11,
        details: [
          "Currency của account draft/pool participant.",
          "Field này được chép thẳng vào `PodAcCurrency` của orchestration record."
        ]
      },
      {
        name: "AA.BH.ACC.PRODUCT",
        slot: 12,
        details: [
          "Product sẽ dùng để tạo account draft trong pool.",
          "Nó đi cặp với company/currency/customer để build account orchestration."
        ]
      },
      {
        name: "AA.BH.NEW.BUNDLE.REF",
        slot: 16,
        details: [
          "Bundle reference mới trong flow move/restructure/change pool.",
          "Trong `HANDOFF.DETAILS`, field này được chép sang `PodNewBundleRef` và còn được viết vào service list."
        ]
      },
      {
        name: "AA.BH.PARENT.ACCOUNT",
        slot: 17,
        details: [
          "Account cha mà account draft hiện tại sẽ link vào.",
          "Source dùng field này để xác định level và sequence của account trong pool."
        ]
      },
      {
        name: "AA.BH.LINK.TYPE",
        slot: 18,
        details: [
          "Loại thao tác pool: `LINK`, `DELINK`, `CLOSE`, `CHANGE.PARENT`, `UPDATE`, `SET.LIVE.DATE`, `CHANGE.POOL`.",
          "Field này điều khiển cách orchestration service xử lý record bundle hierarchy."
        ]
      },
      {
        name: "AA.BH.KEEP.BALANCE",
        slot: 19,
        details: [
          "Cờ giữ lại balance trong pool khi di chuyển account.",
          "Field này được chép sang `PodBalInPool` để orchestration biết có giữ số dư trong pool hay không."
        ]
      },
      {
        name: "AA.BH.LIVE.DATE",
        slot: 20,
        details: [
          "Ngày live của từng account trong pool.",
          "Nếu field này trống, `AA.BUNDLE.HIERARCHY.UPDATE.b` sẽ đọc `AA.POOL.ORCHESTRATION.DETAILS` cũ để suy ra live date theo `ACCOUNT.REF`."
        ]
      },
      {
        name: "AA.BH.ACC.LOCATION",
        slot: 23,
        details: [
          "Thông tin location của account draft.",
          "Field được chép thẳng vào `PodAccLocation` trong orchestration details."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE BUNDLE.HIERARCHY",
        routine: "AA.BUNDLE.HIERARCHY.UPDATE.b",
        summary: "Theo dõi change-condition ở input/delete, còn ở auth sẽ lấy bundle hierarchy record, suy ra live date và gọi processor ghi `AA.BUNDLE.HIERARCHY.DETAILS` theo mode thích hợp.",
        steps: [
          "Bước 1: routine đọc full status AAA, processing mode của master activity, effective date, arrangement id, master activity, initiation type và product line.",
          "Bước 2: `UNAUTH`, `DELETE`, `REVERSE` chỉ gọi `AA.Framework.UpdateChangeCondition()`.",
          "Bước 3: ở `AUTH`, routine lấy `R.BUNDLE.HIERARCHY` từ `R.NEW`, đọc `ACCOUNT.REF` và `LIVE.DATE`.",
          "Bước 4: nếu `LIVE.DATE` trống, source đọc `AA.BundleHierarchy.PoolOrchestrationDetails` của bundle hiện tại hoặc bundle cũ trong cross-pool, locate theo `ACCOUNT.REF`, rồi lấy lại live date từ `PodLiveDate`.",
          "Bước 5: routine chọn `PROCESS.TYPE` giữa `AUTH`, `PRELIMINARY.AUTH`, `PRELIMINARY.UPDATE`, `MOVE.TO.LIVE` hoặc rỗng tùy processing mode, master activity, initiation type và trạng thái `NEW.OFFER`.",
          "Bước 6: cuối cùng gọi `AA.BundleHierarchy.ProcessBundleHierarchyDetails(PROCESS.TYPE, ARRANGEMENT.ID, EFFECTIVE.DATE, R.BUNDLE.HIERARCHY, R.BUNDLE.HIERARCHY.DETAILS, ACCOUNT.LISTS, RET.ERROR)` để ghi details thật."
        ],
        flow: [
          "Đọc `AA.POOL.ORCHESTRATION.DETAILS` để suy ra live date khi field live date trống.",
          "Handoff ghi `AA.BUNDLE.HIERARCHY.DETAILS` sang `AA.BundleHierarchy.ProcessBundleHierarchyDetails(...)`.",
          "Các nhánh ngoài auth chỉ track next condition change."
        ]
      },
      {
        name: "HANDOFF BUNDLE.HIERARCHY",
        routine: "AA.BUNDLE.HIERARCHY.HANDOFF.b",
        summary: "Auth path build pool orchestration details từ bundle hierarchy rồi ghi bảng/list file; unauth restructure path chỉ validate CT accounts và raise error nếu có.",
        steps: [
          "Bước 1: routine đọc status AAA, activity hiện tại, effective date, arrangement id và bundle hierarchy record từ `R.NEW`.",
          "Bước 2: ở `AUTH`, gọi `AA.BundleHierarchy.BundleHierarchyHandoffDetails(ArrId, RBundleHierarchy, Activity, Error)` để build orchestration record; nếu routine trả warning thì store override.",
          "Bước 3: ở `UNAUTH` và activity `RESTRUCTURE`, routine cũng gọi `BundleHierarchyHandoffDetails(...)`, nhưng nếu có lỗi thì split từng error message, set field `BhAccountRef`, `AV` theo vị trí account và raise end error.",
          "Bước 4: nhánh `AUTH-REV` không làm gì thêm."
        ],
        flow: [
          "Không trực tiếp write bảng trong file này.",
          "Handoff toàn bộ build/write orchestration sang `AA.BUNDLE.HIERARCHY.HANDOFF.DETAILS`."
        ]
      },
      {
        name: "HANDOFF.DETAILS BUNDLE.HIERARCHY",
        routine: "AA.BUNDLE.HIERARCHY.HANDOFF.DETAILS.b",
        summary: "Build record `AA.POOL.ORCHESTRATION.DETAILS` từ bundle hierarchy và, tùy process type, write vào table và service list.",
        steps: [
          "Bước 1: nếu `ProcessType = DRAFT`, routine map các field `ACCOUNT.REF` tới `LIVE.DATE` của bundle hierarchy sang các field `Pod*` trong orchestration record rồi write table.",
          "Bước 2: nếu `ProcessType = RESTRUCTURE` hoặc `SWITCH.TO.PRELIMINARY`, routine kiểm tra CT account, kiểm tra record pool cũ đã tồn tại chưa, build orchestration record, write table rồi write thêm service list.",
          "Bước 3: nếu `ProcessType = INTEGRITY.CHECK`, routine đổi id thành `ArrId-INTEGRITY.CHECK`, set `PodOverallStatus = Processing...`, rồi write table và service list.",
          "Bước 4: trong `BuildPoolOrchestrationRecord`, source chép trực tiếp `BhAccountRef`, `BhAccountAlias`, `BhCustomer`, `BhAcCompany`, `BhAcCurrency`, `BhAcProduct`, `BhNewBundleRef`, `BhParentAccount`, `BhLinkType`, `BhBalInPool`, `BhLiveDate`, `BhAccLocation` vào record `Pod*` tương ứng.",
          "Bước 5: routine gọi `AA.BundleHierarchy.SequenceAccountList(...)` để tính `PodAccSequence` và luôn set `PodOverallStatus = Processing...`."
        ],
        flow: [
          "Ghi trực tiếp `AA.POOL.ORCHESTRATION.DETAILS`.",
          "Ghi service list orchestration cho các process type phù hợp."
        ]
      },
      {
        name: "DATA.CAPTURE BUNDLE.HIERARCHY",
        routine: "AA.BUNDLE.HIERARCHY.DATA.CAPTURE.b",
        summary: "Draft-auth path ghi `AA.POOL.ORCHESTRATION.DETAILS` bằng process type `DRAFT`; auth-rev path xóa orchestration record.",
        steps: [
          "Bước 1: routine đọc `ActivityStatus`, `FullActivityStatus`, `ArrangementId`, `RBundleHierarchy` từ `R.NEW`.",
          "Bước 2: nếu `AUTH`, gọi `AA.BundleHierarchy.BundleHierarchyHandoffDetails(ArrangementId, RBundleHierarchy, \"DRAFT\", Error)` để build và write orchestration record.",
          "Bước 3: nếu `AUTH-REV`, gọi `AA.BundleHierarchy.PoolOrchestrationDetailsDelete(ArrangementId, \"\")` để xóa record draft orchestration."
        ],
        flow: [
          "Đụng trực tiếp `AA.POOL.ORCHESTRATION.DETAILS` qua handoff details hoặc delete API."
        ]
      },
      {
        name: "FUNCTION BUNDLE.HIERARCHY",
        routine: "AA.BUNDLE.HIERARCHY.FUNCTION.b",
        summary: "Chặn function `R` cho `UPDATE-BUNDLE.HIERARCHY` khi request đi từ browser/session OFS.",
        steps: [
          "Bước 1: routine đọc current activity, activity action và property class hiện tại.",
          "Bước 2: gọi `AA.Framework.CheckBrowserRequest(BrowserReqFlag)` để biết request có đi qua browser hay không.",
          "Bước 3: nếu `VFunction = R`, action là `UPDATE`, property class là `BUNDLE.HIERARCHY` và request là browser request, routine set lỗi `EB.FIC.INVALID.FUNT` rồi store end error."
        ],
        flow: [
          "Không ghi bảng business.",
          "Chỉ chặn function không hợp lệ ở tầng function validation."
        ]
      }
    ]
  },
  "interest-compensation": {
    name: "INTEREST.COMPENSATION",
    slug: "interest-compensation",
    fields: [
      {
        name: "AA.ICOMP.RECIPIENT.PRODUCT",
        slot: 3,
        details: [
          "Product hoặc nhóm product nhận phần bù lãi trong bundle.",
          "Field này là đầu lọc phía recipient trước khi xét property cụ thể."
        ]
      },
      {
        name: "AA.ICOMP.OFFSET.TYPE",
        slot: 4,
        details: [
          "Cách tính offset: theo `POOL` hoặc `RECIPIENT`.",
          "Trong các thay đổi gần đây của source, field này còn được cập nhật xuống `AA.ARRANGEMENT` để giữ đúng cách offset."
        ]
      },
      {
        name: "AA.ICOMP.RECIPIENT.PROPERTY",
        slot: 5,
        details: [
          "Property interest ở phía recipient được bù lãi.",
          "Field này dùng để xác định arrangement recipient nào phải được trigger `MAINTAIN-INTEREST`."
        ]
      },
      {
        name: "AA.ICOMP.MAX.OFFSET",
        slot: 6,
        details: [
          "Tỷ lệ hoặc hệ số offset tối đa cho compensation.",
          "Giá trị này được cập nhật vào link data của arrangement bundle để engine compensation biết giới hạn offset."
        ]
      },
      {
        name: "AA.ICOMP.DONOR.PRODUCT",
        slot: 8,
        details: [
          "Product hoặc nhóm product của donor arrangement.",
          "Source update dùng field này để xác định participant arrangement nào phải mang role/link type donor."
        ]
      },
      {
        name: "AA.ICOMP.DONOR.PROPERTY",
        slot: 9,
        details: [
          "Property donor sẽ nhường phần interest hoặc balance cho recipient.",
          "Field này đi cùng donor accrual và donate type để xác định donor-side processing."
        ]
      },
      {
        name: "AA.ICOMP.DONOR.ACCRUAL",
        slot: 13,
        details: [
          "Cách xử lý accrual của donor: `CALCULATE`, `SUPPRESS`, `INFO.ONLY`.",
          "Đây là field quyết định có phải trigger suppress/maintain interest trên donor hay chỉ giữ thông tin."
        ]
      },
      {
        name: "AA.ICOMP.DONOR.BALANCE.TYPE",
        slot: 14,
        details: [
          "Balance type ở donor dùng làm nguồn bù lãi.",
          "Field check sang `AC.BALANCE.TYPE`, dùng để xác định bucket soft-accounting/balance nào bị liên kết."
        ]
      },
      {
        name: "AA.ICOMP.DONATE.TYPE",
        slot: 15,
        details: [
          "Source calc type sẽ được donate từ donor sang recipient.",
          "Field này lấy từ `AA.SOURCE.CALC.TYPE` và là chìa khóa xác định kiểu nguồn tiền/lãi được bù."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE INTEREST.COMPENSATION",
        routine: "AA.INTEREST.COMPENSATION.UPDATE.b",
        summary: "Đọc product bundle hiện tại và trước đó, quyết định có phải xử lý online hay offline, rồi cập nhật link interest-compensation và trigger maintain-interest cho donor/recipient khi cần.",
        steps: [
          "Bước 1: routine đọc `R.NEW`, `R.OLD` của interest compensation, current bundle property, previous bundle property, arrangement id, effective date và product id.",
          "Bước 2: gọi `AA.InterestCompensation.ProductBundleCheckLinks(PRODUCT.ID, EFFECTIVE.DATE, MASTER.ACTIVITY.NAME, R.PRODUCT.BUNDLE, \"\", PROCESS.FLAG)` để biết có phải xử lý ngay hay để offline.",
          "Bước 3: `GET.PREVIOUS.CURRENT.RECORDS` lấy current và previous `PRODUCT.BUNDLE` property qua `AA.ProductFramework.GetPropertyRecord(...)` và `AA.Framework.GetPreviousPropertyRecord(...)`.",
          "Bước 4: các nhánh input/delete/reverse/auth dùng cùng bộ current/old bundle + current/old IC record để update link type, max offset, donor/recipient role và payin/payout account information trên `AA.ARRANGEMENT`.",
          "Bước 5: ở auth và auth-rev, source theo comment chỉ trigger `MAINTAIN-INTEREST` khi file accrual được xử lý qua service, thông qua common routine `AA.InterestCompensation.UpdateInterestCompensation(...)`."
        ],
        flow: [
          "Đọc current/previous `PRODUCT.BUNDLE` và `INTEREST.COMPENSATION` records.",
          "Update link và donor/recipient metadata trên `AA.ARRANGEMENT` qua common interest-compensation APIs.",
          "Trigger `MAINTAIN-INTEREST` cho donor/recipient khi tới nhánh auth phù hợp."
        ]
      },
      {
        name: "CLOSE INTEREST.COMPENSATION",
        routine: "AA.INTEREST.COMPENSATION.CLOSE.b",
        summary: "Trong close bundle, auth path gọi common update routine để trigger `MAINTAIN-INTEREST` và cập nhật process activities cho interest compensation.",
        steps: [
          "Bước 1: routine đọc `ACTIVITY.STATUS`, `EFFECTIVE.DATE`, `ARRANGEMENT.ID`, sau đó lấy current `PRODUCT.BUNDLE` property của arrangement.",
          "Bước 2: chỉ khi effective date không lớn hơn today, source mới tiếp tục xử lý.",
          "Bước 3: ở `AUTH`, routine set `REV.FLAG = 1` vì close bundle được xử lý như reversal của bundle arrangement.",
          "Bước 4: gọi `AA.InterestCompensation.UpdateInterestCompensation(R.PRODUCT.BUNDLE, R.PRODUCT.BUNDLE, REV.FLAG, RET.ERROR)` để trigger maintain-interest và update process activities cho donor/recipient."
        ],
        flow: [
          "Không tự write bill hay accounting.",
          "Handoff logic close compensation cho common `UpdateInterestCompensation(...)`."
        ]
      }
    ]
  },
  participant: {
    name: "PARTICIPANT",
    slug: "participant",
    fields: [
      {
        name: "AA.PRT.BANK.ROLE",
        slot: 3,
        details: [
          "Vai trò của ngân hàng trong syndication: `AGENT`, `AGENT CUM PARTICIPANT` hoặc `PARTICIPANT`.",
          "Field là `NOCHANGE`, tức vai trò đã chốt sẽ không cho sửa trực tiếp ở amendment thường."
        ]
      },
      {
        name: "AA.PRT.OWN.COMMIT.AMT",
        slot: 4,
        details: [
          "Phần commitment amount thuộc ngân hàng sở hữu chính.",
          "Trong `AA.PARTICIPANT.UPDATE.b`, field này được tính lại từ `TERM.AMOUNT.AMOUNT` trừ đi tổng commitment của participants."
        ]
      },
      {
        name: "AA.PRT.OWN.COMMIT.PERC",
        slot: 5,
        details: [
          "Tỷ lệ commitment còn lại thuộc ngân hàng chính.",
          "Source update tính field này bằng `100 - SUM(ParticipantPerc)`."
        ]
      },
      {
        name: "AA.PRT.PARTICIPANT",
        slot: 11,
        details: [
          "Danh sách participant customers tham gia deal.",
          "Field này là input chính cho mọi phép tính phân bổ commitment và repayment theo participant."
        ]
      },
      {
        name: "AA.PRT.COMMITMENT.AMT",
        slot: 12,
        details: [
          "Commitment amount của từng participant.",
          "Trong activity increase/decrease/new, `AA.PARTICIPANT.UPDATE.b` tính lại amount này theo pro-rata trên `TERM.AMOUNT.CHANGE.AMOUNT`."
        ]
      },
      {
        name: "AA.PRT.COMMITMENT.PERC",
        slot: 13,
        details: [
          "Tỷ lệ commitment của từng participant.",
          "Source update ghi lại field này vào `R.NEW` sau khi chuẩn hóa amount/percentage."
        ]
      },
      {
        name: "AA.PRT.PARTICIPANT.ROLE",
        slot: 14,
        details: [
          "Vai trò nghiệp vụ của participant trong customer-role setup.",
          "Field là `NOINPUT`; hệ thống suy ra vai trò phù hợp thay vì cho người dùng gõ tự do."
        ]
      },
      {
        name: "AA.PRT.BENEFICIARY.CCY",
        slot: 20,
        details: [
          "Currency của beneficiary trả participant.",
          "Field mở ra nhánh participant payout qua beneficiary hoặc payment order product."
        ]
      },
      {
        name: "AA.PRT.BENF.PROP.CLASS",
        slot: 21,
        details: [
          "Property class của beneficiary settlement.",
          "Field này đi cùng `BENF.PROPERTY`, `BENEFICIARY.ID`, `BENF.PO.PRODUCT`."
        ]
      },
      {
        name: "AA.PRT.SKIM.PROPERTY",
        slot: 28,
        details: [
          "Property dùng để skim hoặc tách phần margin/fee khỏi participant payout.",
          "Field đi cùng `MARGIN.OPER` và `MARGIN.RATE` để điều chỉnh rate participant."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE PARTICIPANT",
        routine: "AA.PARTICIPANT.UPDATE.b",
        summary: "Tính lại amount và percentage của participant/own-share theo `TERM.AMOUNT` khi balance treatment là participation, rồi ghi ngược vào `R.NEW` và participant common.",
        steps: [
          "Bước 1: routine đọc linked account, participant list, participant record từ `R.NEW`, bank role và effective date.",
          "Bước 2: gọi `AA.Account.GetAccountBalanceTreatment(...)` để biết account có balance treatment kiểu participation hay không.",
          "Bước 3: đọc property `TERM.AMOUNT` bằng `AA.ProductFramework.GetPropertyRecord(...)`, lấy `CurrentAmount = AmtAmount`.",
          "Bước 4: nếu balance treatment là participation và activity là `INCREASE`, `DECREASE` hoặc new arrangement, source lấy participant amount hiện tại; với `INCREASE/DECREASE` thì dùng `R.OLD` rồi gọi `CalculatePartAmt` để phân bổ lại theo `CHANGE.AMOUNT` bằng pro-rata.",
          "Bước 5: routine validate participant, tính `OwnCommitAmt = CurrentAmount - SUM(ParticipantAmt)` và `OwnCommitPerc = 100 - SUM(ParticipantPerc)`, rồi update lại các field `PrtOwnCommitPerc`, `PrtCommitmentPerc`, `PrtOwnCommitAmt`, `PrtCommitmentAmt` trên `R.NEW`.",
          "Bước 6: gọi `AA.Participant.SetParticipantCommon(ArrangementId, EffectiveDate, AccountId, ParticipantRec, ..., RetError)` để refresh participant common."
        ],
        flow: [
          "Đọc `TERM.AMOUNT` và account balance treatment.",
          "Ghi ngược `R.NEW` của participant property.",
          "Cập nhật participant common qua `AA.Participant.SetParticipantCommon(...)`."
        ]
      },
      {
        name: "ALLOCATE.PAYMENT PARTICIPANT",
        routine: "AA.PARTICIPANT.ALLOCATE.PAYMENT.b",
        summary: "Lấy số tiền borrower vừa repay ở current và bill level, chia lại số đó cho own bank và participants, rồi cập nhật activity balances cho phần participant.",
        steps: [
          "Bước 1: routine kiểm tra arrangement có participant hợp lệ hay không bằng `AA.Participant.CheckValidParticipant(...)` và lấy linked account, arrangement currency.",
          "Bước 2: `GetParticipantList` gọi `AA.Participant.GetParticipantsCommon(...)` để lấy participants, accounting type, amount, percentage, entry type.",
          "Bước 3: `GetCurrentAmount` lấy current repayment amount bằng `AA.Framework.ProcessActivityBalances(ArrangementId, \"GET\", \"\", ArrActivityId, BorrowerPropertyList, BorrowerBalanceType, PropertyRepayAmount, RetError)` cho property `ACCOUNT` và `INTEREST`.",
          "Bước 4: `GetBillAmount` lấy các bill đã repay của borrower bằng `AA.PaymentSchedule.GetBill(...)` theo `RepaymentReference`, rồi đọc từng `AA.BILL.DETAILS` để cộng borrower bill repayment amount.",
          "Bước 5: nếu có repayment amount và participant list, routine chia repayment cho participants và own bank, rồi build lại `AA.ACTIVITY.BALANCES` cho participant-side entries.",
          "Bước 6: rounding difference được giữ lại ở bucket `.ROUNDING` theo enhancement trong source."
        ],
        flow: [
          "Đọc `AA.ACTIVITY.BALANCES` và `AA.BILL.DETAILS` của borrower.",
          "Ghi lại `AA.ACTIVITY.BALANCES` cho participant repayment allocation.",
          "Không trực tiếp gọi bill manager; routine tập trung vào participant-side balance allocation."
        ]
      }
    ]
  },
  facility: {
    name: "FACILITY",
    slug: "facility",
    fields: [
      {
        name: "AA.FAC.SERVICE",
        slot: 3,
        details: [
          "Nhóm dịch vụ hoặc service group được mở trên facility.",
          "Trong `AA.FACILITY.EVALUATE.b`, service group thực dùng lại được lấy từ context `TRANSACTION.SERVICE.GROUP` của activity để đối chiếu với field này."
        ]
      },
      {
        name: "AA.FAC.SERVICE.AVAILABILITY",
        slot: 4,
        details: [
          "Trạng thái khả dụng của dịch vụ: `AVAILABLE`, `BLOCKED`, `OPTIONAL`.",
          "Field này cho biết facility có cho phép service group của activity hiện tại chạy hay không."
        ]
      },
      {
        name: "AA.FAC.CUSTOMER.OPTION",
        slot: 5,
        details: [
          "Lựa chọn opt-in hoặc opt-out của khách hàng với dịch vụ facility.",
          "Field này là lớp quyết định cuối cùng ở phía customer sau khi service được product bật."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE FACILITY",
        routine: "AA.FACILITY.UPDATE.b",
        summary: "Wrapper change-condition cho property facility.",
        steps: [
          "Bước 1: routine đọc status AAA, activity id, effective date, arrangement id và property id.",
          "Bước 2: ở `UNAUTH`, `DELETE`, `REVERSE`, routine chỉ gọi `AA.Framework.UpdateChangeCondition()`.",
          "Bước 3: nhánh `AUTH` không tự ghi file nghiệp vụ nào."
        ],
        flow: [
          "Không tự update limit hay scheduled activity.",
          "Chỉ track next condition change."
        ]
      },
      {
        name: "EVALUATE FACILITY",
        routine: "AA.FACILITY.EVALUATE.b",
        summary: "Lấy service group từ activity context, so với facility record hiện tại và chặn activity nếu service group không được phép.",
        steps: [
          "Bước 1: routine đọc `TRANSACTION.SERVICE.GROUP` từ activity context bằng `AA.Framework.GetContextValue(...)`.",
          "Bước 2: ở `UNAUTH`, lấy facility record hiện tại từ `R.NEW` rồi gọi `AA.Facility.DetermineAllowedService(FacilityRecord, ServiceGroup, AllowedLevel, Message)`.",
          "Bước 3: nếu `AllowedLevel = ERROR`, routine set field error trên activity, set `AV = 1`, rồi raise end error bằng `EB.ErrorProcessing.StoreEndError()`."
        ],
        flow: [
          "Không ghi bảng dữ liệu.",
          "Chỉ validate quyền chạy service group của activity hiện tại."
        ]
      },
      {
        name: "CHECK.PRODUCT FACILITY",
        routine: "AA.FACILITY.CHECK.PRODUCT.b",
        summary: "Kiểm tra company hiện tại có cài product line `FL` hay không.",
        steps: [
          "Bước 1: routine locate mã ứng dụng `FL` trong `Company.EbComApplications` của company hiện tại.",
          "Bước 2: nếu thấy thì trả `VALID.PRODUCT = 1`, nếu không thì trả rỗng."
        ],
        flow: [
          "Đọc company record, không ghi gì."
        ]
      }
    ]
  },
  "sub-arrangement-condition": {
    name: "SUB.ARRANGEMENT.CONDITION",
    slug: "sub-arrangement-condition",
    fields: [
      {
        name: "AA.SAC.PRODUCT.LINE",
        slot: 3,
        details: [
          "Product line của sub-arrangement mà rule condition sẽ áp vào.",
          "Field là lớp lọc cao nhất trước product group và product."
        ]
      },
      {
        name: "AA.SAC.PRODUCT.GROUP",
        slot: 4,
        details: [
          "Product group của sub-arrangement áp rule.",
          "Dùng để gom rule theo nhóm sản phẩm con."
        ]
      },
      {
        name: "AA.SAC.PRODUCT",
        slot: 5,
        details: [
          "Product cụ thể của sub-arrangement.",
          "Nếu field này có giá trị, rule condition được neo đúng vào product con thay vì product group."
        ]
      },
      {
        name: "AA.SAC.CURRENCY",
        slot: 6,
        details: [
          "Currency của sub-arrangement cần match để rule có hiệu lực.",
          "Field tách điều kiện tiền tệ khỏi product/property."
        ]
      },
      {
        name: "AA.SAC.PROPERTY",
        slot: 7,
        details: [
          "Property của sub-arrangement bị kiểm tra hoặc default.",
          "Trong update, field này được dùng để suy ra `PROPERTY.CLASS` hệ thống."
        ]
      },
      {
        name: "AA.SAC.ATTRIBUTE",
        slot: 10,
        details: [
          "Attribute nghiệp vụ mà sub-arrangement phải match.",
          "Source update dùng field này để suy ra `SYS.ATTRIBUTE`, `TYPE` và `LINK` hệ thống."
        ]
      },
      {
        name: "AA.SAC.VALUE",
        slot: 11,
        details: [
          "Giá trị kỳ vọng của attribute.",
          "Nó là vế dữ liệu để rule condition so sánh."
        ]
      },
      {
        name: "AA.SAC.MESSAGE",
        slot: 12,
        details: [
          "Mức phản hồi khi rule bị vi phạm: `ERROR` hoặc `OVERRIDE`.",
          "Field này quyết định rule chỉ cảnh báo hay chặn hẳn."
        ]
      },
      {
        name: "AA.SAC.PROPERTY.CLASS",
        slot: 15,
        details: [
          "Property class hệ thống suy ra từ `PROPERTY`; là `NOINPUT`.",
          "Trong update, field này được default tự động chứ không cho nhập tay."
        ]
      },
      {
        name: "AA.SAC.SYS.ATTRIBUTE",
        slot: 16,
        details: [
          "Tên attribute hệ thống tương ứng với attribute nghiệp vụ đã chọn.",
          "Field này được API determine-link ghi vào `R.NEW` để engine đọc nhanh."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE SUB.ARRANGEMENT.CONDITION",
        routine: "AA.SUB.ARRANGEMENT.CONDITION.UPDATE.b",
        summary: "Default các field hệ thống của sub-arrangement condition ngay ở input, gồm property class, sys attribute, type và link.",
        steps: [
          "Bước 1: routine đọc `SubArrConditionRecord` từ `R.NEW`.",
          "Bước 2: ở `UNAUTH`, gọi `AA.SubArrangementCondition.DetermineSubArrangementConditionLink(SubArrConditionRecord, PClist, AttributeList, Type, LinkList)`.",
          "Bước 3: source ghi thẳng các giá trị hệ thống vào `R.NEW` bằng `EB.SystemTables.setRNew(...)` cho các field `SYS.ATTRIBUTE`, `PROPERTY.CLASS`, `TYPE`, `LINK`."
        ],
        flow: [
          "Không tự gọi update change condition.",
          "Chỉ enrich `R.NEW` bằng metadata hệ thống cho rule condition."
        ]
      }
    ]
  },
  "sub-arrangement-rules": {
    name: "SUB.ARRANGEMENT.RULES",
    slug: "sub-arrangement-rules",
    fields: [
      {
        name: "AA.SAR.CUSTOMER",
        slot: 3,
        details: [
          "Rule chọn customer của sub-arrangement: customer của parent, allowed list hoặc bất kỳ.",
          "Field này điều khiển cách kiểm tra customer hợp lệ cho sub-arrangement."
        ]
      },
      {
        name: "AA.SAR.REQUIRED.CUSTOMER",
        slot: 4,
        details: [
          "Yêu cầu có đủ `ALL` hay chỉ cần `ANY` customer trong allowed list.",
          "Nó là mức nghiêm ngặt của điều kiện customer."
        ]
      },
      {
        name: "AA.SAR.ALLOWED.CUSTOMER",
        slot: 5,
        details: [
          "Danh sách customer được phép tham gia làm sub-arrangement.",
          "Field này chỉ dùng khi rule customer là allowed-list."
        ]
      },
      {
        name: "AA.SAR.CURRENCY",
        slot: 8,
        details: [
          "Rule currency của sub-arrangement: currency của parent, allowed list hoặc bất kỳ.",
          "Tách logic currency khỏi product rule."
        ]
      },
      {
        name: "AA.SAR.ALLOWED.CURRENCY",
        slot: 9,
        details: [
          "Danh sách currency được phép khi rule currency là allowed-list.",
          "Field này đi cùng `CURRENCY.MARKET` và `EXCH.RATE.TYPE` cho flow đa tiền tệ."
        ]
      },
      {
        name: "AA.SAR.PRODUCT",
        slot: 12,
        details: [
          "Rule product của sub-arrangement: allowed list hoặc bất kỳ.",
          "Field này bật kiểm soát product con độc lập với customer/currency."
        ]
      },
      {
        name: "AA.SAR.ALLOWED.PRD.GROUP",
        slot: 13,
        details: [
          "Danh sách product group được phép của sub-arrangement.",
          "Đây là lớp lọc product group trước product cụ thể."
        ]
      },
      {
        name: "AA.SAR.ALLOWED.PRODUCT",
        slot: 14,
        details: [
          "Danh sách product cụ thể được phép.",
          "Field này chốt product whitelist thực sự cho sub-arrangement."
        ]
      },
      {
        name: "AA.SAR.TERM.RECALCULATION",
        slot: 17,
        details: [
          "Cho phép hệ thống tự tính lại term khi tạo sub-arrangement mới.",
          "Field này là cờ rules-level, không phải data của `TERM.AMOUNT`."
        ]
      },
      {
        name: "AA.SAR.CURRENCY.MARKET",
        slot: 20,
        details: [
          "Currency market dùng khi sub-arrangement tạo theo rule đa tiền tệ.",
          "Field hỗ trợ xác định thị trường tỷ giá khi parent và child khác currency."
        ]
      },
      {
        name: "AA.SAR.EXCH.RATE.TYPE",
        slot: 21,
        details: [
          "Loại tỷ giá dùng để chuyển currency cho sub-arrangement: `SELL.RATE`, `BUY.RATE`, `MID.RATE`.",
          "Field này đi cùng `CURRENCY.MARKET`."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE SUB.ARRANGEMENT.RULES",
        routine: "AA.SUB.ARRANGEMENT.RULES.UPDATE.b",
        summary: "Wrapper change-condition cho sub-arrangement rules.",
        steps: [
          "Bước 1: routine đọc status AAA, effective date, arrangement id và property id.",
          "Bước 2: ở `UNAUTH`, `DELETE`, `REVERSE`, routine gọi `AA.Framework.UpdateChangeCondition()`.",
          "Bước 3: nhánh `AUTH` không có update nghiệp vụ riêng."
        ],
        flow: [
          "Không write bảng nào ngoài việc track next condition change."
        ]
      }
    ]
  },
  "sub-limits": {
    name: "SUB.LIMITS",
    slug: "sub-limits",
    fields: [
      {
        name: "AA.SUBL.RISK.CRITERION",
        slot: 3,
        details: [
          "Data element dùng làm tiêu chí tách sub-limit.",
          "Field lookup sang `AA.DATA.ELEMENTS`; các `CRITERION.1..10` là giá trị tương ứng cho tiêu chí này."
        ]
      },
      {
        name: "AA.SUBL.CRITERION.1",
        slot: 7,
        details: [
          "Giá trị criterion đầu tiên để xác định một sub-limit.",
          "Cùng với `CRITERION.2..10`, field này tạo key nghiệp vụ cho restriction limit."
        ]
      },
      {
        name: "AA.SUBL.SUB.LIMITS.CCY",
        slot: 17,
        details: [
          "Currency của sub-limit; hiện field definition cho option `FACILITY.CCY`.",
          "Nó cho biết sub-limit đi theo currency facility chứ không phải tùy ý."
        ]
      },
      {
        name: "AA.SUBL.SUB.LIMITS.AMOUNT",
        slot: 18,
        details: [
          "Amount của sub-limit cho tổ hợp risk criterion đang định nghĩa.",
          "Đây là giá trị restriction limit thực sự sẽ được handoff sang limit engine."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE SUB.LIMITS",
        routine: "AA.SUB.LIMITS.UPDATE.b",
        summary: "Handoff restriction limits ở các nhánh update/delete/auth phù hợp và đồng thời track next condition change.",
        steps: [
          "Bước 1: routine đọc short status và full status của AAA.",
          "Bước 2: ở `UNAUTH` và `DELETE`, nếu không phải new arrangement thì gọi `AA.SubLimits.RestrictionLimitsHandOff()` rồi `AA.Framework.UpdateChangeCondition()`.",
          "Bước 3: ở `AUTH`, nếu là new arrangement hoặc `AUTH-REV` thì cũng gọi `RestrictionLimitsHandOff()` rồi update change condition.",
          "Bước 4: ở `DELETE-REV` và `REVERSE`, source chỉ update change condition."
        ],
        flow: [
          "Handoff restriction limit thật sang `AA.SubLimits.RestrictionLimitsHandOff()`.",
          "Song song đó track next condition change qua `AA.Framework.UpdateChangeCondition()`."
        ]
      }
    ]
  },
  "term-amount": {
    name: "TERM.AMOUNT",
    slug: "term-amount",
    fields: [
      {
        name: "AA.AMT.AMOUNT",
        slot: 3,
        details: [
          "Số commitment hoặc principal hiện hành của arrangement.",
          "Field này là nguồn amount chính cho draw, redeem, increase/decrease và cho các phép tính own/participant share."
        ]
      },
      {
        name: "AA.AMT.CHANGE.AMOUNT",
        slot: 4,
        details: [
          "Biến động amount trong activity tăng/giảm commitment hoặc amount.",
          "Các routine tăng/giảm và participant update dùng field này để tính lại amount theo pro-rata."
        ]
      },
      {
        name: "AA.AMT.TERM",
        slot: 5,
        details: [
          "Kỳ hạn của arrangement.",
          "Ở arrangement/simulation, source cho phép kiểu chữ để hệ thống có thể recalc term theo số ngày khi maturity date đổi."
        ]
      },
      {
        name: "AA.AMT.REVOLVING",
        slot: 6,
        details: [
          "Cách quay vòng commitment: `NO`, `PAYMENT`, `PREPAYMENT`.",
          "Field này ảnh hưởng trực tiếp logic repay và khả năng tái sử dụng commitment."
        ]
      },
      {
        name: "AA.AMT.UPDATE.COMMT.LIMIT",
        slot: 7,
        details: [
          "Cho phép update commitment limit của facility khi drawing thay đổi amount hay không.",
          "Trong các routine draw/increase/decrease, field này là cờ chặn hoặc mở `UpdateFacilityCommitment(...)`."
        ]
      },
      {
        name: "AA.AMT.MATURITY.DATE",
        slot: 8,
        details: [
          "Ngày đáo hạn của arrangement.",
          "Action update ghi field này xuống `AA.ACCOUNT.DETAILS` và dùng để schedule mature/cancel activity."
        ]
      },
      {
        name: "AA.AMT.EXPIRY.DATE",
        slot: 11,
        details: [
          "Ngày hết hiệu lực của commitment.",
          "Field này được update vào `AA.ACCOUNT.DETAILS` và còn tham gia flow expiry activity cho commitment."
        ]
      },
      {
        name: "AA.AMT.COMMITMENT.DRAWDOWN",
        slot: 13,
        details: [
          "Cách drawdown commitment: `AUTO`, `SCHEDULE`, `MANUAL`.",
          "Field này là cờ điều khiển auto-disbursement hoặc scheduled drawdown."
        ]
      },
      {
        name: "AA.AMT.ON.MATURITY",
        slot: 14,
        details: [
          "Xử lý khi đến maturity, ví dụ chuyển `DUE`.",
          "Field này quyết định hậu quả nghiệp vụ tại ngày đáo hạn."
        ]
      },
      {
        name: "AA.AMT.UPDATE.UTILISATION",
        slot: 15,
        details: [
          "Cho phép raise accounting/update utilisation khi disburse hay không.",
          "Trong các enhancement gần của source, field này dùng để quyết định có raise entry UTL lúc draw/disburse."
        ]
      },
      {
        name: "AA.AMT.UPDATE.COMMIT.ON.CAP",
        slot: 16,
        details: [
          "Quy định cập nhật commitment khi repay/capitalise overdraw: `Current`, `Current And Overdraw`, `Overdraw`.",
          "Field này chi phối nhánh xử lý commitment trong các routine repay/capitalise."
        ]
      },
      {
        name: "AA.AMT.CANCEL.PERIOD",
        slot: 17,
        details: [
          "Khoảng thời gian trước khi hệ thống schedule cancel arrangement/deposit.",
          "Action update dùng field này để tính `CANCEL.DATE` và update scheduled activity."
        ]
      }
    ],
    actions: [
      {
        name: "DRAW TERM.AMOUNT",
        routine: "AA.TERM.AMOUNT.DRAW.b",
        summary: "Xử lý disbursement/draw against commitment: đọc amount từ AAA, kiểm tra available commitment, cập nhật limit/facility commitment, build accounting event và cập nhật activity balances khi cần.",
        steps: [
          "Bước 1: routine đọc AAA hiện tại, arrangement id, linked account, effective date và current action.",
          "Bước 2: source lấy balance type thật của property bằng `AA.ProductFramework.PropertyGetBalanceName(...)` với lifecycle stage `TOT`.",
          "Bước 3: routine đọc movement amount từ `R.NEW.AmtAmount`, kiểm tra draw có làm commitment overdraw hay không, đồng thời xét `UPDATE.COMMT.LIMIT` và `UPDATE.UTILISATION` để biết có phải update facility commitment/utilisation hay không.",
          "Bước 4: nếu đến nhánh accounting validation, routine gọi `AA.Accounting.GetAccountingEventType(...)`, build `EVENT.REC` với amount, sign, balance type, value date, reversal indicator rồi append vào event list.",
          "Bước 5: gọi `AA.Accounting.AccountingManager(...)` để raise accounting entries.",
          "Bước 6: các enhancement sau này còn gọi limit/facility APIs để cập nhật commitment maturity date, utilisation và participant-specific processing khi property `PARTICIPANT` có mặt."
        ],
        flow: [
          "Đọc `TERM.AMOUNT` record, AAA và balance name của property.",
          "Handoff accounting sang `AA.Accounting.AccountingManager(...)`.",
          "Các nhánh limit/facility commitment update được đẩy sang common `AA.TermAmount.UpdateFacilityCommitment(...)` và limit APIs."
        ]
      },
      {
        name: "REDEEM TERM.AMOUNT",
        routine: "AA.TERM.AMOUNT.REDEEM.b",
        summary: "Lấy amount hiện tại của term amount khi redeem deposit, dựng accounting event debit trên balance `TOT` rồi gọi accounting manager để đảo amount đó ra khỏi arrangement.",
        steps: [
          "Bước 1: routine đọc status AAA, action, effective date, arrangement id và linked account.",
          "Bước 2: `GET.BALANCE.TYPE` gọi `AA.ProductFramework.PropertyGetBalanceName(...)` với lifecycle stage `TOT` để lấy balance type commitment/current term amount.",
          "Bước 3: `GET.MOVEMENT.AMOUNT` đọc `AmtAmount` từ `R.NEW` làm movement amount.",
          "Bước 4: nếu process mode là `VAL`, routine gọi `AA.Accounting.GetAccountingEventType(...)`, build `EVENT.REC` với `E_amount = MVMT.AMOUNT`, `E_sign = DEBIT`, `E_balanceType = BALANCE.TYPE`, `E_valueDate = EFFECTIVE.DATE`.",
          "Bước 5: `CALL.ACCOUNTING.MANAGER` gọi `AA.Accounting.AccountingManager(REQD.PROCESS, ..., MULTI.EVENT.REC, RET.ERROR)` ở validate stage, hoặc gọi manager ở mode khác cho auth/delete/reverse."
        ],
        flow: [
          "Không trực tiếp cập nhật bill hay account details trong routine này.",
          "Trọng tâm là build accounting event cho movement amount của `TERM.AMOUNT`."
        ]
      },
      {
        name: "UPDATE TERM.AMOUNT",
        routine: "AA.TERM.AMOUNT.UPDATE.b",
        summary: "Cập nhật `AA.SCHEDULED.ACTIVITY`, `AA.ACCOUNT.DETAILS` và các activity schedule phụ khi maturity, cancel period, tranche hoặc commitment schedule của term amount thay đổi.",
        steps: [
          "Bước 1: routine đọc `MATURITY.DATE`, `CANCEL.PERIOD`, `TRANCHES`, `COMMITMENT.TYPE` từ `R.NEW`.",
          "Bước 2: ở `UNAUTH`, source set `UPD.MODE = UPDATE`, rồi gọi `UPDATE.SCHEDULED.ACTIVITY` để cycle hoặc amend các activity mature/cancel liên quan.",
          "Bước 3: nếu không lỗi, routine gọi `UPDATE.ACCOUNT.DETAILS` để ghi maturity date, cancel date hoặc expiry date vào `AA.ACCOUNT.DETAILS`.",
          "Bước 4: nếu `TRANCHES = YES`, source gọi `UPDATE.TRANCHE.ACTIVITY` để đồng bộ schedule tranche.",
          "Bước 5: nếu `COMMITMENT.TYPE` có `COMMITMENT.SCHEDULE`, gọi `UPDATE.COMMITMENT.ACTIVITY`; nếu có `UNAVAILABILITY.SCHEDULE`, gọi `UPDATE.UNAVAILABILITY.ACTIVITY`.",
          "Bước 6: ở `DELETE` và `REVERSE`, routine chuyển `UPD.MODE = REVERSE`, lấy maturity date cũ rồi chạy lại đúng các flow trên để hoàn nguyên schedule và account details."
        ],
        flow: [
          "Ghi `AA.SCHEDULED.ACTIVITY` qua `AA.Framework.SetScheduledActivity(...)`.",
          "Ghi `AA.ACCOUNT.DETAILS` cho maturity/cancel/expiry data.",
          "Handoff management của commitment schedule sang `AA.TermAmount.CommitmentScheduleManager(...)`."
        ]
      }
    ]
  }
};
