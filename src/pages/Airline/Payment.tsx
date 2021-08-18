import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonLoading,
  IonPage,
  IonRippleEffect,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  isPlatform,
  useIonViewDidEnter,
} from "@ionic/react";

import { chevronDown, chevronUp, timeOutline } from "ionicons/icons";
import React, { useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { connect } from "../../data/connect";
import * as selectors from "../../data/selectors";
import { setTourPaymentAllowStatus } from "../../data/tour/tour.actions";
import "./Order.scss";
import AirlineWizard from "../../components/Airline/AirlineWizard";
import AirlinePaymentChoosePayment from "../../components/Airline/AirlinePaymentChoosePayment";
import AirlinePaymentVoucherCode from "../../components/Airline/AirlinePaymentVoucherCode";
import { Collapse } from "antd";
import { AppId, MainUrl } from "../../data/services";
import { HTTP } from "@ionic-native/http";
const { Panel } = Collapse;
interface OwnProps {}
interface StateProps {
  UserData: any;
}
interface DispatchProps {
  setTourPaymentAllowStatus: typeof setTourPaymentAllowStatus;
}
interface OrderProps
  extends OwnProps,
    StateProps,
    DispatchProps,
    RouteComponentProps {}
const Order: React.FC<OrderProps> = ({ history, UserData }) => {
  const [hiddenDetailPrice, setHiddenDetailPrice] = useState(true);
  const [hiddenDetailPriceChevronUp, setHiddenDetailPriceChevronUp] =
    useState(false);
  const [hiddenDetailPriceChevronDown, setHiddenDetailPriceChevronDown] =
    useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [headerAlert, setHeaderAlert] = useState<string>();
  const [messageAlert, setMessageAlert] = useState<string>();
  const failedAlert = (errorMessage: string) => {
    setShowLoading(false);
    setHeaderAlert("Gagal");
    setMessageAlert(errorMessage);
    setShowAlert(true);
  };
  const seeDetailPrice = () => {
    setHiddenDetailPrice(false);
    setHiddenDetailPriceChevronUp(true);
    setHiddenDetailPriceChevronDown(false);
  };
  const hideDetailPrice = () => {
    setHiddenDetailPrice(true);
    setHiddenDetailPriceChevronUp(false);
    setHiddenDetailPriceChevronDown(true);
  };
  useIonViewDidEnter(() => {
    bookDetail();
  });
  const bookDetail = () => {
    setShowLoading(true);
    var MyHeaders = {
      appid: AppId,
      "Content-Type": "application/json",
      RequestVerificationToken: UserData.requestVerificationToken,
    };
    var MyData = JSON.stringify({
      Id: localStorage.getItem("AirlineBookingId"),
      accToken: UserData.accessToken,
    });
    if (isPlatform("cordova")) {
      HTTP.post(MainUrl + "Member/AirlineBookingDetail", MyData, Headers)
        .then((res) => {
          if (res.status !== 200) {
            failedAlert("Periksa Koneksi anda");
          }
          // return JSON.parse(ABDB);
        })
        .then((res) => {
          BookDetailSuccess(res);
        })
        .catch((err) => {
          failedAlert(JSON.stringify(err));
        });
    } else {
      fetch(MainUrl + "Member/AirlineBookingDetail", {
        method: "POST",
        headers: MyHeaders,
        body: MyData,
      })
        .then((r) => {
          if (r.ok) {
            return r.json();
          } else {
            failedAlert("Periksa Koneksi Anda");
          }
        })
        .then((res) => {
          BookDetailSuccess(res);
        })
        .catch((err) => {
          failedAlert("Periksa Koneksi Internet");
        });
    }
  };
  const submitPayment = () => {
    setShowLoading(true);
    var MyHeaders = {
      appid: AppId,
      "Content-Type": "application/json",
      RequestVerificationToken: UserData.requestVerificationToken,
    };
    var MyData = JSON.stringify({
      product_category: "flightTicket",
      payment_method: "41",
      id_order: localStorage.getItem("AirlineTransactionID"),
      accToken: UserData.accessToken,
    });
    if (isPlatform("cordova")) {
      HTTP.post(MainUrl + "Payment/paymentProceed", MyData, Headers)
        .then((res) => {
          if (res.status !== 200) {
            failedAlert("Periksa Koneksi anda");
          }
          // return JSON.parse(ABDB);
        })
        .then((res) => {
          SubmitSuccess(res);
        })
        .catch((err) => {
          failedAlert(JSON.stringify(err));
        });
    } else {
      fetch(MainUrl + "Payment/paymentProceed", {
        method: "POST",
        headers: MyHeaders,
        body: MyData,
      })
        .then((r) => {
          if (r.ok) {
            return r.json();
          } else {
            failedAlert("Periksa Koneksi Anda");
          }
        })
        .then((res) => {
          SubmitSuccess(res);
        })
        .catch((err) => {
          failedAlert("Periksa Koneksi Internet");
        });
    }
  };
  const SubmitSuccess = (res) => {
    if (res.StatusCode === 200) {
      setShowLoading(false);
      history.push("/airlineComplete");
    } else {
      failedAlert("Ada Masalah Koneksi");
    }
  };
  const BookDetailSuccess = (res) => {
    setShowLoading(false);
    localStorage.setItem("AirlineTransactionID", res.TransactionID);
  };
  return (
    <IonPage>
      {/* Header */}
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/airlineSearchFirstFlight"></IonBackButton>
          </IonButtons>
          <IonTitle>Konfirmasi Pembayaran</IonTitle>
        </IonToolbar>
        <AirlineWizard WizardIndex={2}></AirlineWizard>
      </IonHeader>
      <IonContent fullscreen={true} className="AirlineOrder">
        <IonGrid className="orange-bg ion-padding ion-margin-bottom timer">
          <IonRow>
            <IonCol size="2" className="avatar">
              <IonIcon icon={timeOutline} size="large" color="light"></IonIcon>
            </IonCol>
            <IonCol>
              <div>
                <IonText color="light">
                  <p>
                    {/* <small>Selesaikan pembayaran dalam {TimeLimit}</small> */}
                    <small>Selesaikan pembayaran dalam {"5 menit"}</small>
                  </p>
                </IonText>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
        <AirlinePaymentChoosePayment
          UserData={UserData}
        ></AirlinePaymentChoosePayment>
        <AirlinePaymentVoucherCode></AirlinePaymentVoucherCode>
      </IonContent>

      <IonFooter>
        <IonCard className="ion-no-margin ion-no-padding footerPrice">
          <IonGrid>
            <IonRow class="priceCollapse">
              <IonCol size="6">
                <IonText color="medium">Harga yang harus dibayar</IonText>
              </IonCol>
              <IonCol size="6" className="ion-text-right">
                <IonText>
                  <h5 className="ion-no-margin">
                    Rp 20.800.000
                    <IonIcon
                      icon={chevronUp}
                      hidden={hiddenDetailPriceChevronUp}
                      size="large"
                      color="primary"
                      onClick={() => seeDetailPrice()}
                    ></IonIcon>
                    <IonIcon
                      icon={chevronDown}
                      hidden={hiddenDetailPriceChevronDown}
                      size="large"
                      color="primary"
                      onClick={() => hideDetailPrice()}
                    ></IonIcon>
                  </h5>
                </IonText>
              </IonCol>
            </IonRow>
            <IonRow hidden={hiddenDetailPrice}>
              <IonCol size="6">
                <IonText color="medium">2x Dewasa</IonText>
              </IonCol>
              <IonCol size="6" className="ion-text-right">
                <IonText color="medium">Rp 28.000.000</IonText>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonButton
                  className="text-transform-none"
                  size="large"
                  expand="block"
                  // onClick={() => Pay()}
                  onClick={() => submitPayment()}
                >
                  Bayar
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCard>
      </IonFooter>
      <IonLoading isOpen={showLoading} message={"Mohon Tunggu..."} />
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={headerAlert}
        message={messageAlert}
        buttons={["OK"]}
      />
    </IonPage>
  );
};
export default connect<{}, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    UserData: selectors.getUserData(state),
  }),
  // mapDispatchToProps: {
  // },
  component: React.memo(withRouter(Order)),
});
