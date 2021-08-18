import React, {useState} from 'react';
import { IonContent,IonToolbar , IonCard,IonButton,IonCardContent,IonPage,IonFooter,IonHeader, IonRow, IonGrid, IonButtons, IonBackButton, IonTitle, IonCol, IonSlides, IonSlide, IonText, IonIcon, IonLoading, IonAlert, isPlatform} from '@ionic/react';
import {calendarOutline,timerOutline} from 'ionicons/icons';
import { RouteComponentProps, withRouter } from 'react-router';
import { connect } from '../../data/connect';
import './BookingSeriesSelectPax.scss';
import { rupiah } from '../../helpers/currency';
import { AppId, MainUrl } from '../../data/services';
import { loadTourBookingData, TourBookingLastSubmit } from '../../data/tour/tour.actions';
import { HTTP } from '@ionic-native/http';
import { stringDateConvert } from '../../helpers/datetime';
interface OwnProps { };
interface StateProps {
  TourBookingPriceTotal? :number
  TourProductDetail? : any
  TourProductPricingIndex?: number
  TourProductStartDate?:string
  TourPaymentAllowStatus:boolean
};
interface DispatchProps {
  TourBookingLastSubmit: typeof TourBookingLastSubmit;
  loadTourBookingData: typeof loadTourBookingData;
}
interface BookingSeriesSelectPaxProps extends OwnProps, StateProps, DispatchProps,RouteComponentProps { };
const BookingSeriesSelectPax: React.FC<BookingSeriesSelectPaxProps> = ({
  history,
  loadTourBookingData,
  TourProductPricingIndex,
  TourProductDetail,
  TourProductStartDate,
  TourPaymentAllowStatus,
  TourBookingLastSubmit
}) => {
  const [ProductTourMinPax,setProductTourMinPax] = useState(1);
  // Pax Adjustment
  const [adultPax, setAdultPax] = useState<number>(1);
  const [childPax, setChildPax] = useState<number>(0);
  const [AdultPrice, setAdultPrice] = useState<number>(0);
  const [ChildPrice, setChildPrice] = useState<number>(0);
  const [TotalPax, setTotalPax] = useState<number>(1);
  const [TotalPrice, setTotalPrice] = useState<number>(0);

  const [showLoading, setShowLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [headerAlert, setHeaderAlert] = useState<string>();
  const [messageAlert, setMessageAlert] = useState<string>();
  React.useEffect(() => {
    if(history.location.pathname==="/tourBookingSeriesSelectPax" && !TourPaymentAllowStatus){
      window.location.replace('/main/transactionList');
    }
  }, [history.location.pathname]);
  React.useEffect(()=>{
    // Tour Product Pricing List
    const TPPL = TourProductDetail.TourProductPricingList[TourProductPricingIndex?TourProductPricingIndex:0];
    setProductTourMinPax(TPPL.TourProductPricingMinimal)
    // Fitler Pricing Detail
    const filterDetailPricing =
    TourProductDetail.TourProductDetailPricingList
    .filter((item: { TourProductDetailPricingTourProductPricingId: any; })=>
    item.TourProductDetailPricingTourProductPricingId == TPPL.TourProductPricingId);
    // Set Price
    if(filterDetailPricing.length>0){
      if(filterDetailPricing.lenth>1){
        setAdultPrice(filterDetailPricing[0].TourProductDetailPricingJual);
        setChildPrice(filterDetailPricing[1].TourProductDetailPricingJual);
      }else{
        setAdultPrice(filterDetailPricing[0].TourProductDetailPricingJual);
        setChildPrice(filterDetailPricing[0].TourProductDetailPricingJual);
      }
    }else{
      failedAlert('Produk Tidak Valid');
      history.push('/main/index')
    }
  }, [TourProductPricingIndex])
  const plusAdult = () =>{
    setAdultPax(adultPax + 1);
    setTotalPax(TotalPax+1);
  }
  const minusAdult = () =>{
    if (adultPax > 0 && TotalPax > 1) {setAdultPax(adultPax - 1);setTotalPax(TotalPax-1)};
  }
  const plusChild = () =>{
    setChildPax(childPax + 1);
    setTotalPax(TotalPax+1);
  }
  const minusChild = () =>{
    if (childPax > 0 && TotalPax > 1) {setChildPax(childPax - 1);setTotalPax(TotalPax-1)};
  }
  const bookingSubmit = () => {
    setShowLoading(true);
    var MyData = new FormData();
    MyData.append("tourBookingDetailModels.NumberOfAdult", String(adultPax));
    MyData.append("tourBookingDetailModels.NumberOfChild", String(childPax));
    MyData.append("tourBookingDetailModels.NumberOfInfant", "0");
    if(isPlatform('cordova')){
      HTTP.setDataSerializer('multipart');
      HTTP.post(MainUrl+'tour/Booking',MyData,{'appid':AppId})
      .then(res => {
        if(res.status!==200){
          failedAlert('Cek Koneksi Internet Anda');
        }
        return JSON.parse(res.data)
      })
      .then(res=>{
        if(res.StatusCode===200 && res.Data.Allowed === true){
          setShowLoading(false);
          TourBookingLastSubmit(adultPax,childPax,0,TotalPax,TotalPrice);
          loadTourBookingData();
          history.push('/tourOrder');
        }else{
          failedAlert(res.ErrorMessage)
        }
      })
      .catch(e=>{
        failedAlert('Koneksi Anda Bermasalah')
      })
    }else{
      fetch(MainUrl+'tour/Booking',{
        method:'POST',
        headers:{'appid':AppId},
        body: MyData
      })
      .then(res=>{
        if(res.ok){
          return res.json();
        }else{
          failedAlert('Cek Koneksi Internet Anda');
        }
      })
      .then(res=>{
        if(res.StatusCode===200 && res.Data.Allowed === true){
          setShowLoading(false);
          TourBookingLastSubmit(adultPax,childPax,0,TotalPax,TotalPrice);
          loadTourBookingData();
          history.push('/tourOrder');
        }else{
          failedAlert(res.ErrorMessage)
        }
      })
      .catch(e=>{
        failedAlert('Koneksi Anda Bermasalah')
      })
    }
  }
  const failedAlert = (errorMessage:string) =>{
    setShowLoading(false);
    setHeaderAlert('Gagal');
    setMessageAlert(errorMessage);
    setShowAlert(true);
  }
  // const successAlert = (successMessage:string) =>{
  //   setShowLoading(false);
  //   setHeaderAlert('Sukses');
  //   setMessageAlert(successMessage);
  //   setShowAlert(true);
  // }
  React.useEffect(()=>{
    const calculate = (adultPax*AdultPrice) + (childPax*ChildPrice);
    setTotalPrice(calculate)
  }, [adultPax,AdultPrice,childPax,ChildPrice])
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tourBookingSeries"></IonBackButton>
          </IonButtons>
          <IonTitle>
          {TourProductDetail.TourProductModels.ProductTourName?
          TourProductDetail.TourProductModels.ProductTourName:'Tour Series Select Pax'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen={true} class="BookingSeriesSelectPax">
        <IonGrid className="white-bg ion-padding">
          <IonRow>
          <IonCol size="8">
            <div>
            <IonText color="dark"><p className="ion-no-margin">Tanggal Pilihan</p></IonText>
            {/* <IonText color="dark"><p className="ion-no-margin">{TourBookingPriceTotal}</p></IonText> */}
            <IonText color="medium"><small>{stringDateConvert(TourProductStartDate||'')}</small></IonText>
            </div>
              </IonCol>
              <IonCol className="ion-text-right">
                <IonButton className="btn btn-outline-primary text-transform-none" onClick={()=>history.goBack()}>
                  Ubah
                </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonCard className="ion-margin-top tourBookingSeriesPackageCard">
          <IonCardContent>
          <div>
          <IonText color="dark"><h5><b>1 Pax ({TourProductDetail.TourProductModels.ProductTourName})</b></h5></IonText>
          <IonText color="medium"><h6><IonIcon icon={calendarOutline}></IonIcon> Hanya berlaku pada tanggal keberangkatan yang dipilih</h6></IonText>
          <IonText color="medium"><h6><IonIcon icon={timerOutline}></IonIcon> Reservasi diharuskan min. 7 hari sebelum hari keberangkatan</h6> </IonText>
          </div>
          </IonCardContent>
        </IonCard>
        <IonCard className="ion-margin-top touchSpin">
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="6">
                  <div>
                  <IonText color="medium"><small>Dewasa</small></IonText>
                  <IonText color="dark"><h6>{rupiah(AdultPrice)}</h6></IonText>
                  </div>
                </IonCol>
                <IonCol className="ion-text-right">
                  <IonButton onClick={()=>minusAdult()} size="small" color="light" className="btn">-</IonButton>
                  <IonButton size="small" className="btn btn-outline-primary " disabled={true}>{adultPax}</IonButton>
                  <IonButton onClick={()=>plusAdult()} size="small" className="btn btn-outline-primary ">+</IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>
        <IonCard className="ion-margin-top touchSpin">
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="6">
                  <div>
                  <IonText color="medium"><small>Anak-anak (Dibawah 8 tahun)</small></IonText>
                  <IonText color="dark"><h6>{rupiah(ChildPrice)}</h6></IonText>
                  </div>
                </IonCol>
                <IonCol className="ion-text-right">
                  <IonButton onClick={()=>minusChild()} size="small" color="light" className="btn">-</IonButton>
                  <IonButton  size="small" className="btn btn-outline-primary " disabled={true}>{childPax}</IonButton>
                  <IonButton onClick={()=>plusChild()} size="small" className="btn btn-outline-primary ">+</IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

      </IonContent>
      <IonLoading
        isOpen={showLoading}
        message={'Mohon Tunggu...'}
      />
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={headerAlert}
        message={messageAlert}
        buttons={['OK']}
      />
      <IonFooter>
        <IonCard className="ion-no-margin ion-no-padding footerPrice">
          <IonGrid>
            <IonRow>
              <IonCol size="7">
                <IonText color="medium"><small>Harga yang harus dibayar</small></IonText>
              <IonText><h4 className="ion-no-margin">{rupiah(TotalPrice)}</h4></IonText>
              </IonCol>
              <IonCol size="5">
                <IonButton expand="block" className="text-transform-none" onClick={bookingSubmit}>Beli Sekarang</IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCard>
      </IonFooter>
    </IonPage>
  );
};
export default connect<{}, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    TourBookingPriceTotal: state.tour.TourBookingPriceTotal,
    TourProductDetail: state.tour.TourProductDetail,
    TourProductPricingIndex: state.tour.TourProductPricingIndex,
    TourProductStartDate: state.tour.TourProductStartDate,
    TourPaymentAllowStatus: state.tour.TourPaymentAllowStatus,

  }),
  mapDispatchToProps: {
    TourBookingLastSubmit,loadTourBookingData
  },
  component: React.memo(withRouter(BookingSeriesSelectPax))
});
