// import { userInfor } from '@/core/global';

export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  // console.log('@@access@@');
  // console.log(currentUser);
  return {
    // canLogin: userInfor && userInfor.name,
    canAdmin: false,
    // canAdmin: currentUser && currentUser.group === 'a11',
    canAdmin2: currentUser && currentUser.group === 'a1',
  };
}
